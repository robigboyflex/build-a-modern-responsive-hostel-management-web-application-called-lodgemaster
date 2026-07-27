import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { statusLabel } from "@/lib/hooks";
import { FileText, Clock, CheckCircle2, XCircle, DoorOpen, BedDouble, Wallet, Activity } from "lucide-react";

export const Route = createFileRoute("/_authenticated/manager")({
  head: () => ({ meta: [{ title: "Manager Dashboard — LodgeMaster" }, { name: "description", content: "Hostel manager control center." }] }),
  component: MgrDash,
});

function MgrDash() {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, avail: 0, occ: 0, unpaid: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const b = await supabase.from("bookings").select("*, profiles(full_name,email), room_types(name)").order("created_at", { ascending: false });
      const r = await supabase.from("rooms").select("status");
      const list = b.data ?? [];
      setRecent(list.slice(0, 8));
      setStats({
        total: list.length,
        pending: list.filter((x: any) => ["pending_verification", "pending_room", "pending_documents"].includes(x.status)).length,
        approved: list.filter((x: any) => x.status === "approved").length,
        rejected: list.filter((x: any) => x.status === "rejected").length,
        avail: (r.data ?? []).filter((x: any) => x.status === "available").length,
        occ: (r.data ?? []).filter((x: any) => x.status === "occupied").length,
        unpaid: list.filter((x: any) => x.status === "pending_payment").length,
      });
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Manager Dashboard</h1><p className="text-muted-foreground mt-1">Overview of hostel operations.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={FileText} label="Total Applications" v={stats.total} />
        <Stat icon={Clock} label="Pending" v={stats.pending} tone="warning" />
        <Stat icon={CheckCircle2} label="Approved" v={stats.approved} tone="success" />
        <Stat icon={XCircle} label="Rejected" v={stats.rejected} tone="destructive" />
        <Stat icon={DoorOpen} label="Available Rooms" v={stats.avail} tone="success" />
        <Stat icon={BedDouble} label="Occupied Rooms" v={stats.occ} />
        <Stat icon={Wallet} label="Pending Payments" v={stats.unpaid} tone="warning" />
        <Stat icon={Activity} label="Total Rooms" v={stats.avail + stats.occ} />
      </div>

      <Card className="border-border/60">
        <CardHeader><CardTitle>Recent Applications</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground border-b border-border">
                <tr><th className="py-2">Student</th><th>Room Type</th><th>Status</th><th>Submitted</th></tr>
              </thead>
              <tbody>
                {recent.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">No applications yet.</td></tr>}
                {recent.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 last:border-0">
                    <td className="py-3">{r.profiles?.full_name ?? r.profiles?.email ?? "—"}</td>
                    <td>{r.room_types?.name ?? "—"}</td>
                    <td><Badge variant="secondary">{statusLabel(r.status)}</Badge></td>
                    <td className="text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ icon: Icon, label, v, tone = "muted" }: { icon: any; label: string; v: number; tone?: "success" | "warning" | "destructive" | "muted" }) {
  const bg = { success: "bg-success/15 text-success", warning: "bg-warning/20 text-warning-foreground", destructive: "bg-destructive/15 text-destructive", muted: "bg-primary-soft text-primary" }[tone];
  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <div className={`grid h-10 w-10 place-items-center rounded-lg ${bg}`}><Icon className="h-5 w-5"/></div>
        <div className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-bold">{v}</div>
      </CardContent>
    </Card>
  );
}
