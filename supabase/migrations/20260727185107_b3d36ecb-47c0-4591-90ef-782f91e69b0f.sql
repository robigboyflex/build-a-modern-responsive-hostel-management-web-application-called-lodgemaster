-- 1. Add new enum value
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'expired';

-- 2. Add deadline columns
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_deadline timestamptz,
  ADD COLUMN IF NOT EXISTS documents_deadline timestamptz;

-- 3. Backfill deadlines for existing active bookings
UPDATE public.bookings
SET payment_deadline = COALESCE(payment_deadline, now() + interval '7 days')
WHERE status = 'pending_payment' AND payment_deadline IS NULL;

UPDATE public.bookings
SET documents_deadline = COALESCE(documents_deadline, now() + interval '7 days')
WHERE status IN ('pending_documents', 'pending_room') AND documents_deadline IS NULL;

-- 4. Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  booking_id uuid,
  kind text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  link text,
  read boolean NOT NULL DEFAULT false,
  dedupe_key text UNIQUE,
  email_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_pending_email ON public.notifications(email_sent) WHERE email_sent = false;

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own notifications read" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "own notifications update" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 5. Deadline processor
CREATE OR REPLACE FUNCTION public.process_booking_deadlines()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  b RECORD;
  hours_left numeric;
  window_label text;
BEGIN
  -- Expire past-deadline bookings
  UPDATE public.bookings
  SET status = 'expired', updated_at = now()
  WHERE status = 'pending_payment' AND payment_deadline IS NOT NULL AND payment_deadline < now();

  UPDATE public.bookings
  SET status = 'expired', updated_at = now()
  WHERE status IN ('pending_documents', 'pending_room')
    AND documents_deadline IS NOT NULL AND documents_deadline < now();

  -- Insert expiry notifications
  INSERT INTO public.notifications (user_id, booking_id, kind, title, body, link, dedupe_key)
  SELECT b.user_id, b.id, 'booking_expired',
         'Your booking has expired',
         'The deadline passed before you completed the next step. You can start a new booking any time.',
         '/book',
         'expired-' || b.id
  FROM public.bookings b
  WHERE b.status = 'expired'
  ON CONFLICT (dedupe_key) DO NOTHING;

  -- Reminders: 48h and 24h before payment deadline
  FOR b IN
    SELECT id, user_id, payment_deadline
    FROM public.bookings
    WHERE status = 'pending_payment'
      AND payment_deadline IS NOT NULL
      AND payment_deadline > now()
  LOOP
    hours_left := EXTRACT(EPOCH FROM (b.payment_deadline - now())) / 3600;
    window_label := NULL;
    IF hours_left <= 24 THEN window_label := '24h';
    ELSIF hours_left <= 48 THEN window_label := '48h';
    END IF;
    IF window_label IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, booking_id, kind, title, body, link, dedupe_key)
      VALUES (b.user_id, b.id, 'payment_reminder',
              'Payment deadline approaching',
              'Please complete your hostel payment before ' || to_char(b.payment_deadline, 'DD Mon YYYY HH24:MI') || ' or your booking will expire.',
              '/payment',
              'payment-' || window_label || '-' || b.id)
      ON CONFLICT (dedupe_key) DO NOTHING;
    END IF;
  END LOOP;

  -- Reminders: 48h and 24h before documents deadline
  FOR b IN
    SELECT id, user_id, documents_deadline
    FROM public.bookings
    WHERE status IN ('pending_documents', 'pending_room')
      AND documents_deadline IS NOT NULL
      AND documents_deadline > now()
  LOOP
    hours_left := EXTRACT(EPOCH FROM (b.documents_deadline - now())) / 3600;
    window_label := NULL;
    IF hours_left <= 24 THEN window_label := '24h';
    ELSIF hours_left <= 48 THEN window_label := '48h';
    END IF;
    IF window_label IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, booking_id, kind, title, body, link, dedupe_key)
      VALUES (b.user_id, b.id, 'documents_reminder',
              'Document upload deadline approaching',
              'Please upload your required documents before ' || to_char(b.documents_deadline, 'DD Mon YYYY HH24:MI') || ' or your booking will expire.',
              '/documents',
              'documents-' || window_label || '-' || b.id)
      ON CONFLICT (dedupe_key) DO NOTHING;
    END IF;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.process_booking_deadlines() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_booking_deadlines() TO service_role;

-- 6. Schedule via pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-booking-deadlines') THEN
    PERFORM cron.unschedule('process-booking-deadlines');
  END IF;
  PERFORM cron.schedule(
    'process-booking-deadlines',
    '*/15 * * * *',
    $cron$SELECT public.process_booking_deadlines();$cron$
  );
END $$;