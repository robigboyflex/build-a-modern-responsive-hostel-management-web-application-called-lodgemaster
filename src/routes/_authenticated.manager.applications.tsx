import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { statusLabel } from "@/lib/hooks";

export const Route = createFileRoute("/_authenticated/manager/applications")({
  head: () => ({ meta: [{ title: "Applications — LodgeMaster" }, { name: "description", content: "Manage applications." }] }),
  component: Apps,
});

function Apps() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState<any | null>(null);

  const load = async () => {
    const { data } = await supabase.from("bookings")
      .select("*, profiles(full_name,email,phone,student_id,institution,account_type,avatar_url), room_types(name), blocks(name), floors(name), rooms(id,room_number,occupied)")
      .order("created_at", { ascending: false });
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const act = async (status: string, note?: string) => {
    if (!open) return;
    const patch: any = { status };
    if (note !== undefined) patch.manager_notes = note;
    const { error } = await supabase.from("bookings").update(patch).eq("id", open.id);
    if (error) return toast.error(error.message);
    if (status === "approved" && open.room_id) {
      await supabase.from("rooms").update({ occupied: (open.rooms?.occupied ?? 0) + 1 }).eq("id", open.room_id);
    }
    toast.success("Updated");
    setOpen(null); load();
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Applications</h1></div>
      <Card className="border-border/60">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left"><tr className="[&>th]:p-3">
              <th>Student</th><th>Room</th><th>Status</th><th>Submitted</th><th></th>
            </tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3"><div className="font-medium">{r.profiles?.full_name}</div><div className="text-xs text-muted-foreground">{r.profiles?.email}</div></td>
                  <td className="p-3">{r.room_types?.name} · {r.blocks?.name} · {r.floors?.name} {r.rooms?.room_number && `· #${r.rooms.room_number}`}</td>
                  <td className="p-3"><Badge variant="secondary">{statusLabel(r.status)}</Badge></td>
                  <td className="p-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="p-3"><Button size="sm" variant="outline" onClick={() => setOpen(r)}>Review</Button></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No applications yet.</td></tr>}
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
          <Info label="ID" v={app.profiles?.student_id ?? "—"}/>
          <Info label="Institution" v={app.profiles?.institution ?? "—"}/>
          <Info label="Type" v={app.profiles?.account_type}/>
          <Info label="Room" v={`${app.room_types?.name ?? "—"} · ${app.blocks?.name ?? ""} · ${app.floors?.name ?? ""} ${app.rooms?.room_number ? "· #"+app.rooms.room_number : ""}`}/>
          <Info label="Fee" v={`GHS ${Number(app.fee ?? 0).toFixed(2)}`}/>
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
        <div>
          <div className="font-medium mb-1">Notes</div>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note for the student..."/>
        </div>
      </div>
      <DialogFooter className="gap-2 flex-wrap">
        <Button variant="outline" onClick={() => onAct("changes_requested", note)}>Request Changes</Button>
        <Button variant="destructive" onClick={() => onAct("rejected", note)}>Reject</Button>
        <Button onClick={() => onAct("approved", note)}>Approve</Button>
      </DialogFooter>
    </>
  );
}

function Info({ label, v }: { label: string; v: string }) {
  return <div><div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div><div className="font-medium">{v}</div></div>;
}
