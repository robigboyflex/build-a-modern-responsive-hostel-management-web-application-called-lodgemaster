import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/manager/students")({
  head: () => ({ meta: [{ title: "Students — LodgeMaster" }, { name: "description", content: "All students." }] }),
  component: Students,
});

function Students() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => { supabase.from("profiles").select("*").order("created_at", { ascending: false }).then(({ data }) => setRows(data ?? [])); }, []);
  const filtered = rows.filter((r) => !q || [r.full_name, r.email, r.student_id, r.nss_number].some((f) => (f ?? "").toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end gap-4 flex-wrap">
        <h1 className="text-3xl font-bold">Students</h1>
        <Input placeholder="Search..." className="max-w-xs" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <Card className="border-border/60"><CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left"><tr className="[&>th]:p-3"><th>Name</th><th>Email</th><th>Type</th><th>Institution</th><th>ID</th><th>Phone</th></tr></thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3 font-medium">{r.full_name}</td>
                <td className="p-3">{r.email}</td>
                <td className="p-3 capitalize">{r.account_type}</td>
                <td className="p-3">{r.institution ?? r.institution_graduated ?? "—"}</td>
                <td className="p-3">{r.student_id ?? r.nss_number ?? "—"}</td>
                <td className="p-3">{r.phone ?? "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No users.</td></tr>}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  );
}
