REVOKE EXECUTE ON FUNCTION public.process_booking_deadlines() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_booking_deadlines() TO service_role;