import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";

const STATUSES = ["available", "occupied", "maintenance", "hidden"];

export const Route = createFileRoute("/_authenticated/manager/rooms")({
  head: () => ({ meta: [{ title: "Rooms — LodgeMaster" }, { name: "description", content: "Manage rooms." }] }),
  component: Rooms,
});

function Rooms() {
  const [rows, setRows] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const load = async () => {
    const [rs, rt, bl, fl] = await Promise.all([
      supabase.from("rooms").select("*, room_types(name,capacity), blocks(name), floors(name,block_id)").order("room_number"),
      supabase.from("room_types").select("*"),
      supabase.from("blocks").select("*"),
      supabase.from("floors").select("*"),
    ]);
    setRows(rs.data ?? []); setTypes(rt.data ?? []); setBlocks(bl.data ?? []); setFloors(fl.data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.room_number || !form.room_type_id || !form.block_id || !form.floor_id) return toast.error("All fields required");
    const rt = types.find((t) => t.id === form.room_type_id);
    const body = {
      room_number: form.room_number,
      room_type_id: form.room_type_id,
      block_id: form.block_id,
      floor_id: form.floor_id,
      capacity: rt?.capacity ?? Number(form.capacity ?? 1),
      status: form.status ?? "available",
    };
    if (edit) { const { error } = await supabase.from("rooms").update(body).eq("id", edit.id); if (error) return toast.error(error.message); }
    else { const { error } = await supabase.from("rooms").insert(body); if (error) return toast.error(error.message); }
    toast.success("Saved");
    setOpen(false); setEdit(null); setForm({}); load();
  };
  const del = async (id: string) => { if (confirm("Delete?")) { await supabase.from("rooms").delete().eq("id", id); load(); } };

  const filtered = rows.filter((r) => !q || [r.room_number, r.room_types?.name, r.blocks?.name, r.floors?.name, r.status].some((x) => String(x ?? "").toLowerCase().includes(q.toLowerCase())));
  const floorOptions = floors.filter((f) => !form.block_id || f.block_id === form.block_id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <h1 className="text-3xl font-bold">Rooms</h1>
        <div className="flex gap-2">
          <Input placeholder="Search..." className="max-w-xs" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button onClick={() => { setEdit(null); setForm({ status: "available" }); setOpen(true); }}><Plus className="h-4 w-4 mr-1"/>New</Button>
        </div>
      </div>
      <Card className="border-border/60"><CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left"><tr className="[&>th]:p-3"><th>#</th><th>Type</th><th>Block</th><th>Floor</th><th>Capacity</th><th>Occupied</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3 font-medium">{r.room_number}</td>
                <td className="p-3">{r.room_types?.name}</td>
                <td className="p-3">{r.blocks?.name}</td>
                <td className="p-3">{r.floors?.name}</td>
                <td className="p-3">{r.capacity}</td>
                <td className="p-3">{r.occupied}</td>
                <td className="p-3"><Badge variant="secondary">{r.status}</Badge></td>
                <td className="p-3 text-right whitespace-nowrap">
                  <Button size="icon" variant="ghost" onClick={() => { setEdit(r); setForm(r); setOpen(true); }}><Pencil className="h-4 w-4"/></Button>
                  <Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">No rooms.</td></tr>}
          </tbody>
        </table>
      </CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit ? "Edit room" : "New room"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2"><Label>Room number</Label><Input value={form.room_number ?? ""} onChange={(e) => setForm({ ...form, room_number: e.target.value })}/></div>
            <div className="space-y-1.5"><Label>Room type</Label>
              <Select value={form.room_type_id ?? ""} onValueChange={(v) => setForm({ ...form, room_type_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select"/></SelectTrigger>
                <SelectContent>{types.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Block</Label>
              <Select value={form.block_id ?? ""} onValueChange={(v) => setForm({ ...form, block_id: v, floor_id: undefined })}>
                <SelectTrigger><SelectValue placeholder="Select"/></SelectTrigger>
                <SelectContent>{blocks.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Floor</Label>
              <Select value={form.floor_id ?? ""} onValueChange={(v) => setForm({ ...form, floor_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select"/></SelectTrigger>
                <SelectContent>{floorOptions.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Status</Label>
              <Select value={form.status ?? "available"} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
