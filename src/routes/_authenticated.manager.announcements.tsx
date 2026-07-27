import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/manager/announcements")({
  head: () => ({ meta: [{ title: "Announcements — LodgeMaster" }, { name: "description", content: "Post announcements." }] }),
  component: Ann,
});

function Ann() {
  const [rows, setRows] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const load = () => supabase.from("announcements").select("*").order("created_at", { ascending: false }).then(({ data }) => setRows(data ?? []));
  useEffect(() => { load(); }, []);

  const post = async () => {
    if (!title || !body) return toast.error("Title and body required");
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("announcements").insert({ title, body, created_by: u.user?.id });
    if (error) return toast.error(error.message);
    setTitle(""); setBody(""); toast.success("Posted"); load();
  };
  const del = async (id: string) => { await supabase.from("announcements").delete().eq("id", id); load(); };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-3xl font-bold">Announcements</h1>
      <Card className="border-border/60">
        <CardHeader><CardTitle>New announcement</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)}/></div>
          <div className="space-y-1.5"><Label>Body</Label><Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)}/></div>
          <Button onClick={post}>Post</Button>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {rows.map((a) => (
          <Card key={a.id} className="border-border/60">
            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-lg">{a.title}</CardTitle><Button size="icon" variant="ghost" onClick={() => del(a.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground whitespace-pre-line">{a.body}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
