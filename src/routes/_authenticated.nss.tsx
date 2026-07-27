import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { statusLabel } from "@/lib/hooks";
import { FileText, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/nss")({
  head: () => ({
    meta: [
      { title: "NSS Reviewer Dashboard — LodgeMaster" },
      { name: "description", content: "Review student and NSS accommodation applications." },
      { property: "og:title", content: "NSS Reviewer Dashboard — LodgeMaster" },
      { property: "og:description", content: "Review applications, verify documents, and update statuses." },
    ],
  }),
  component: NssDashboard,
});

function NssDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, changes: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*, profiles(full_name,email,account_type), room_types(name), blocks(name), floors(name), rooms(room_number)")
        .order("created_at", { ascending: false });
      const rows = data ?? [];
      const pending = rows.filter((r) => r.status === "pending_verification").length;
      const approved = rows.filter((r) => r.status === "approved").length;
      const rejected = rows.filter((r) => r.status === "rejected").length;
      const changes = rows.filter((r) => r.status === "changes_requested").length;
      setStats({ total: rows.length, pending, approved, rejected, changes });
      setRecent(rows.slice(0, 6));
    })();
  }, []);

  const cards = [
    { label: "Awaiting Review", value: stats.pending, icon: Clock, tone: "text-amber-600" },
    { label: "Approved", value: stats.approved, icon: CheckCircle2, tone: "text-emerald-600" },
    { label: "Changes Requested", value: stats.changes, icon: AlertCircle, tone: "text-blue-600" },
    { label: "Rejected", value: stats.rejected, icon: XCircle, tone: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">NSS Reviewer</h1>
          <p className="text-muted-foreground">Verify submissions and update application statuses.</p>
        </div>
        <Button asChild><Link to="/nss/applications"><FileText className="h-4 w-4 mr-2"/>Review Queue</Link></Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="border-border/60">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{c.label}</div>
                <div className="text-3xl font-bold mt-1">{c.value}</div>
              </div>
              <c.icon className={`h-8 w-8 ${c.tone}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60">
        <CardHeader><CardTitle>Recent Applications</CardTitle></CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left"><tr className="[&>th]:p-3">
              <th>Applicant</th><th>Type</th><th>Room</th><th>Status</th><th>Submitted</th>
            </tr></thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="font-medium">{r.profiles?.full_name}</div>
                    <div className="text-xs text-muted-foreground">{r.profiles?.email}</div>
                  </td>
                  <td className="p-3 capitalize">{r.profiles?.account_type ?? "—"}</td>
                  <td className="p-3">{[r.room_types?.name, r.blocks?.name, r.floors?.name, r.rooms?.room_number && `#${r.rooms.room_number}`].filter(Boolean).join(" · ") || "—"}</td>
                  <td className="p-3"><Badge variant="secondary">{statusLabel(r.status)}</Badge></td>
                  <td className="p-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {recent.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No applications yet.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
