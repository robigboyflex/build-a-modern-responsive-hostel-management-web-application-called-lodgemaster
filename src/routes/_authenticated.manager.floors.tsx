import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";

export const Route = createFileRoute("/_authenticated/manager/floors")({
  head: () => ({ meta: [{ title: "Floors — LodgeMaster" }, { name: "description", content: "Manage floors." }] }),
  component: Floors,
});

function Floors() {
  const [rows, setRows] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const load = async () => {
    const [{ data: f }, { data: b }] = await Promise.all([
      supabase.from("floors").select("*, blocks(name)").order("level"),
      supabase.from("blocks").select("*").order("name"),
    ]);
    setRows(f ?? []); setBlocks(b ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.block_id || !form.name) return toast.error("Block and name required");
    const body = { block_id: form.block_id, name: form.name, level: Number(form.level ?? 0) };
    if (edit) await supabase.from("floors").update(body).eq("id", edit.id);
    else await supabase.from("floors").insert(body);
    setOpen(false); setEdit(null); setForm({}); load();
  };
  const del = async (id: string) => { if (confirm("Delete?")) { await supabase.from("floors").delete().eq("id", id); load(); } };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Floors</h1>
        <Button onClick={() => { setEdit(null); setForm({}); setOpen(true); }}><Plus className="h-4 w-4 mr-1"/>New</Button>
      </div>
      <Card className="border-border/60"><CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left"><tr className="[&>th]:p-3"><th>Name</th><th>Level</th><th>Block</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3 font-medium">{r.name}</td>
                <td className="p-3">{r.level}</td>
                <td className="p-3">{r.blocks?.name}</td>
                <td className="p-3 text-right">
                  <Button size="icon" variant="ghost" onClick={() => { setEdit(r); setForm(r); setOpen(true); }}><Pencil className="h-4 w-4"/></Button>
                  <Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No floors.</td></tr>}
          </tbody>
        </table>
      </CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit ? "Edit floor" : "New floor"}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1.5"><Label>Block</Label>
              <Select value={form.block_id ?? ""} onValueChange={(v) => setForm({ ...form, block_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select block"/></SelectTrigger>
                <SelectContent>{blocks.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Name</Label><Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ground Floor"/></div>
            <div className="space-y-1.5"><Label>Level</Label><Input type="number" value={form.level ?? 0} onChange={(e) => setForm({ ...form, level: e.target.value })}/></div>
          </div>
          <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
