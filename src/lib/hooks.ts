import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useProfile() {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { setLoading(false); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      setProfile(data);
      setLoading(false);
    })();
  }, []);
  return { profile, loading, setProfile };
}

export function useCurrentBooking() {
  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const reload = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setLoading(false); return; }
    const { data } = await supabase
      .from("bookings")
      .select("*, room_types(name,fee), blocks(name), floors(name), rooms(room_number)")
      .eq("user_id", u.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setBooking(data);
    setLoading(false);
  };
  useEffect(() => { reload(); }, []);
  return { booking, loading, reload };
}

export const statusLabel = (s: string) => ({
  draft: "Draft",
  pending_payment: "Pending Payment",
  pending_documents: "Pending Documents",
  pending_room: "Pending Room Selection",
  pending_verification: "Pending Verification",
  approved: "Registration Confirmed",
  rejected: "Rejected",
  changes_requested: "Changes Requested",
  expired: "Expired",
}[s] ?? s);

export const DEADLINE_DAYS = 7;
export const deadlineFromNow = (days = DEADLINE_DAYS) =>
  new Date(Date.now() + days * 24 * 3600 * 1000).toISOString();
