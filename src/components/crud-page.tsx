import { useState, useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface FieldDef { key: string; label: string; type?: "text" | "number"; required?: boolean }

export function CrudPage({ title, table, fields, columns, extraLoad, transform }: {
  title: string;
  table: string;
  fields: FieldDef[];
  columns: { key: string; label: string; render?: (r: any) => ReactNode }[];
  extraLoad?: () => Promise<any>;
  transform?: (row: any, extra: any) => Record<string, any>;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [extra, setExtra] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from(table as any).select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
    if (extraLoad) setExtra(await extraLoad());
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const body = transform ? transform(form, extra) : form;
    if (edit) {
      const { error } = await supabase.from(table as any).update(body).eq("id", edit.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from(table as any).insert(body);
      if (error) return toast.error(error.message);
    }
    toast.success("Saved");
    setOpen(false); setEdit(null); setForm({}); load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  const openNew = () => { setEdit(null); setForm({}); setOpen(true); };
  const openEdit = (r: any) => { setEdit(r); setForm(r); setOpen(true); };

  const filtered = rows.filter((r) => !q || columns.some((c) => String(r[c.key] ?? "").toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <h1 className="text-3xl font-bold">{title}</h1>
        <div className="flex gap-2">
          <Input placeholder="Search..." className="max-w-xs" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button onClick={openNew}><Plus className="h-4 w-4 mr-1"/>New</Button>
        </div>
      </div>

      <Card className="border-border/60"><CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left"><tr className="[&>th]:p-3">{columns.map((c) => <th key={c.key}>{c.label}</th>)}<th></th></tr></thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-border">
                {columns.map((c) => <td key={c.key} className="p-3">{c.render ? c.render(r) : r[c.key]}</td>)}
                <td className="p-3 text-right whitespace-nowrap">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-4 w-4"/></Button>
                  <Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={columns.length + 1} className="p-6 text-center text-muted-foreground">No items.</td></tr>}
          </tbody>
        </table>
      </CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit ? `Edit ${title}` : `New ${title}`}</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label>{f.label}</Label>
                <Input type={f.type ?? "text"} value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })}/>
              </div>
            ))}
          </div>
          <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
