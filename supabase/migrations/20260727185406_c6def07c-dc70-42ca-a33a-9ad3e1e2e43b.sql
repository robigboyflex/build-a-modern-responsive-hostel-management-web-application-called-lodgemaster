
-- Extend RLS to allow 'nss' role to review applications alongside managers/admins
DROP POLICY IF EXISTS "own bookings read" ON public.bookings;
CREATE POLICY "own bookings read" ON public.bookings FOR SELECT TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'nss'::app_role));

DROP POLICY IF EXISTS "manager bookings update" ON public.bookings;
CREATE POLICY "reviewer bookings update" ON public.bookings FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'nss'::app_role));

DROP POLICY IF EXISTS "own profile read" ON public.profiles;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'nss'::app_role));

DROP POLICY IF EXISTS "own docs read" ON public.documents;
CREATE POLICY "own docs read" ON public.documents FOR SELECT TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'nss'::app_role));

DROP POLICY IF EXISTS "own notifications read" ON public.notifications;
CREATE POLICY "own notifications read" ON public.notifications FOR SELECT TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'nss'::app_role));
