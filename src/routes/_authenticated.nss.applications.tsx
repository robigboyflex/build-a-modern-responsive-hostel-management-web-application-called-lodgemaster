import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { statusLabel } from "@/lib/hooks";

export const Route = createFileRoute("/_authenticated/nss/applications")({
  head: () => ({
    meta: [
      { title: "Review Applications — LodgeMaster" },
      { name: "description", content: "Review, verify, and update statuses on accommodation applications." },
      { property: "og:title", content: "Review Applications — LodgeMaster" },
      { property: "og:description", content: "NSS reviewer queue for accommodation applications." },
    ],
  }),
  component: NssApps,
});

const STATUS_OPTIONS = [
  "pending_payment", "pending_documents", "pending_room", "pending_verification",
  "approved", "rejected", "changes_requested", "expired",
];

function NssApps() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState<any | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    const { data } = await supabase.from("bookings")
      .select("*, profiles(full_name,email,phone,student_id,institution,account_type,nss_number,place_of_posting,avatar_url), room_types(name), blocks(name), floors(name), rooms(id,room_number,occupied,capacity)")
      .order("created_at", { ascending: false });
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (!q) return true;
    const t = q.toLowerCase();
    return (
      r.profiles?.full_name?.toLowerCase().includes(t) ||
      r.profiles?.email?.toLowerCase().includes(t) ||
      r.profiles?.student_id?.toLowerCase().includes(t) ||
      r.profiles?.nss_number?.toLowerCase().includes(t)
    );
  });

  const act = async (status: string, note?: string) => {
    if (!open) return;
    const patch: any = { status };
    if (note !== undefined) patch.manager_notes = note;
    const { error } = await supabase.from("bookings").update(patch).eq("id", open.id);
    if (error) return toast.error(error.message);
    if (status === "approved" && open.room_id) {
      await supabase.from("rooms").update({ occupied: (open.rooms?.occupied ?? 0) + 1 }).eq("id", open.room_id);
    }
    toast.success("Status updated");
    setOpen(null); load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Review Applications</h1>
        <p className="text-muted-foreground">Verify documents and update application statuses.</p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Input placeholder="Search by name, email, ID, NSS #" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left"><tr className="[&>th]:p-3">
              <th>Applicant</th><th>Type</th><th>Room</th><th>Status</th><th>Submitted</th><th></th>
            </tr></thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="font-medium">{r.profiles?.full_name}</div>
                    <div className="text-xs text-muted-foreground">{r.profiles?.email}</div>
                  </td>
                  <td className="p-3 capitalize">{r.profiles?.account_type ?? "—"}</td>
                  <td className="p-3">{[r.room_types?.name, r.blocks?.name, r.floors?.name, r.rooms?.room_number && `#${r.rooms.room_number}`].filter(Boolean).join(" · ") || "—"}</td>
                  <td className="p-3"><Badge variant="secondary">{statusLabel(r.status)}</Badge></td>
                  <td className="p-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="p-3"><Button size="sm" variant="outline" onClick={() => setOpen(r)}>Review</Button></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No matching applications.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-2xl">
          {open && <ReviewPanel app={open} onAct={act} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReviewPanel({ app, onAct }: { app: any; onAct: (s: string, n?: string) => void }) {
  const [note, setNote] = useState(app.manager_notes ?? "");
  const [status, setStatus] = useState<string>(app.status);
  const [docs, setDocs] = useState<any[]>([]);
  useEffect(() => { supabase.from("documents").select("*").eq("user_id", app.user_id).then(({ data }) => setDocs(data ?? [])); }, [app]);

  const view = async (path: string) => {
    const { data } = await supabase.storage.from("documents").createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  return (
    <>
      <DialogHeader><DialogTitle>Review Application</DialogTitle></DialogHeader>
      <div className="space-y-4 text-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <Info label="Name" v={app.profiles?.full_name}/>
          <Info label="Email" v={app.profiles?.email}/>
          <Info label="Phone" v={app.profiles?.phone ?? "—"}/>
          <Info label="Account Type" v={app.profiles?.account_type}/>
          <Info label="Student / NSS #" v={app.profiles?.student_id ?? app.profiles?.nss_number ?? "—"}/>
          <Info label="Institution" v={app.profiles?.institution ?? "—"}/>
          <Info label="Posting" v={app.profiles?.place_of_posting ?? "—"}/>
          <Info label="Room" v={[app.room_types?.name, app.blocks?.name, app.floors?.name, app.rooms?.room_number && `#${app.rooms.room_number}`].filter(Boolean).join(" · ") || "—"}/>
          <Info label="Fee" v={`GHS ${Number(app.fee ?? 0).toFixed(2)}`}/>
          <Info label="Current status" v={statusLabel(app.status)}/>
        </div>

        <div>
          <div className="font-medium mb-2">Documents</div>
          <div className="grid gap-2">
            {docs.map((d) => (
              <button key={d.id} onClick={() => view(d.file_path)} className="text-left rounded-md border border-border p-2 hover:bg-muted/40">
                <div className="font-medium capitalize">{d.doc_type.replace(/_/g, " ")}</div>
                <div className="text-xs text-muted-foreground truncate">{d.file_name}</div>
              </button>
            ))}
            {docs.length === 0 && <p className="text-muted-foreground text-xs">No documents uploaded.</p>}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="font-medium mb-1">Set status</div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <div className="font-medium mb-1">Reviewer notes</div>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note visible to the student..."/>
        </div>
      </div>
      <DialogFooter className="gap-2 flex-wrap">
        <Button variant="outline" onClick={() => onAct("changes_requested", note)}>Request Changes</Button>
        <Button variant="destructive" onClick={() => onAct("rejected", note)}>Reject</Button>
        <Button variant="secondary" onClick={() => onAct(status, note)}>Save Status</Button>
        <Button onClick={() => onAct("approved", note)}>Approve</Button>
      </DialogFooter>
    </>
  );
}

function Info({ label, v }: { label: string; v: string }) {
  return <div><div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div><div className="font-medium break-words">{v}</div></div>;
}
