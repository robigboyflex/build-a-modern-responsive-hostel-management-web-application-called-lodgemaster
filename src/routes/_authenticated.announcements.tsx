import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/announcements")({
  head: () => ({ meta: [{ title: "Announcements — LodgeMaster" }, { name: "description", content: "Latest announcements from the hostel." }] }),
  component: Ann,
});

function Ann() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { supabase.from("announcements").select("*").order("created_at", { ascending: false }).then(({ data }) => setItems(data ?? [])); }, []);
  return (
    <div className="space-y-6 max-w-3xl">
      <div><h1 className="text-3xl font-bold">Announcements</h1></div>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-muted-foreground">No announcements yet.</p>}
        {items.map((a) => (
          <Card key={a.id} className="border-border/60">
            <CardHeader className="pb-2"><CardTitle className="text-lg">{a.title}</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground whitespace-pre-line">{a.body}</p><div className="text-xs text-muted-foreground mt-3">{new Date(a.created_at).toLocaleDateString()}</div></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
