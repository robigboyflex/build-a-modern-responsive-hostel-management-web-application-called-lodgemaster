import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useCurrentBooking, useProfile, statusLabel } from "@/lib/hooks";
import { supabase } from "@/integrations/supabase/client";
import { BookMarked, BedDouble, Wallet, ClipboardCheck, Megaphone, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — LodgeMaster" }, { name: "description", content: "Your accommodation dashboard." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, isManager } = useAuth();
  const { profile } = useProfile();
  const { booking } = useCurrentBooking();
  const [ann, setAnn] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(5).then(({ data }) => setAnn(data ?? []));
  }, []);

  if (isManager) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Redirecting to manager dashboard...</p>
        <Link to="/manager"><Button>Go to Manager Dashboard</Button></Link>
      </div>
    );
  }

  const regStatus = booking ? statusLabel(booking.status) : "Not Started";
  const roomInfo = booking?.rooms?.room_number ? `Room ${booking.rooms.room_number} · ${booking.blocks?.name}` : booking?.room_types?.name ?? "—";
  const payStatus = booking?.status === "draft" || !booking ? "Not Started" : booking?.status === "pending_payment" ? "Pending" : "Confirmed";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {profile?.full_name?.split(" ")[0] ?? user?.email}</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your accommodation.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ClipboardCheck} label="Registration Status" value={regStatus} tone="primary" />
        <StatCard icon={BedDouble} label="Room Selected" value={roomInfo} />
        <StatCard icon={Wallet} label="Payment Status" value={payStatus} tone={payStatus === "Confirmed" ? "success" : payStatus === "Pending" ? "warning" : "muted"} />
        <StatCard icon={BookMarked} label="Booking Status" value={booking ? statusLabel(booking.status) : "No booking"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Next steps</CardTitle>
            {!booking && <Link to="/book"><Button size="sm">Start booking <ArrowRight className="ml-1 h-4 w-4"/></Button></Link>}
          </CardHeader>
          <CardContent className="space-y-3">
            {!booking && <p className="text-muted-foreground">You haven't started a booking. Book your accommodation to see live updates here.</p>}
            {booking?.status === "pending_payment" && <NextAction to="/payment" label="Complete your payment" />}
            {booking?.status === "pending_documents" && <NextAction to="/documents" label="Upload required documents" />}
            {booking?.status === "pending_room" && <NextAction to="/select-room" label="Select your room" />}
            {booking?.status === "pending_verification" && <p className="text-muted-foreground">Your application is being reviewed by the hostel manager.</p>}
            {booking?.status === "approved" && <p className="text-success font-medium">🎉 Your registration is confirmed!</p>}
            {booking?.manager_notes && <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm"><span className="font-medium">Manager note: </span>{booking.manager_notes}</div>}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader><CardTitle className="flex items-center gap-2"><Megaphone className="h-4 w-4 text-primary"/>Announcements</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {ann.length === 0 && <p className="text-sm text-muted-foreground">No announcements yet.</p>}
            {ann.map((a) => (
              <div key={a.id} className="rounded-lg border border-border p-3">
                <div className="font-medium text-sm">{a.title}</div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.body}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone = "muted" }: { icon: any; label: string; value: string; tone?: "primary" | "success" | "warning" | "muted" }) {
  const bg = { primary: "bg-primary-soft text-primary", success: "bg-success/15 text-success", warning: "bg-warning/20 text-warning-foreground", muted: "bg-muted text-muted-foreground" }[tone];
  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className={`grid h-10 w-10 place-items-center rounded-lg ${bg}`}><Icon className="h-5 w-5"/></div>
        </div>
        <div className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-1 text-lg font-semibold truncate">{value}</div>
      </CardContent>
    </Card>
  );
}

function NextAction({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to as any}>
      <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary-soft p-4 hover:bg-primary/10 transition">
        <span className="font-medium text-primary">{label}</span>
        <ArrowRight className="h-4 w-4 text-primary" />
      </div>
    </Link>
  );
}
