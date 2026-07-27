import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentBooking } from "@/lib/hooks";
import { DeadlineCountdown } from "@/components/deadline-countdown";
import { Upload, FileCheck2, Trash2 } from "lucide-react";

const DOC_TYPES = [
  { key: "passport_photo", label: "Passport Photograph" },
  { key: "payment_receipt", label: "Payment Receipt" },
  { key: "student_id", label: "Student ID or NSS Posting Letter" },
  { key: "ghana_card", label: "Ghana Card or Passport" },
];
const ALLOWED = ["application/pdf", "image/png", "image/jpeg"];
const MAX = 10 * 1024 * 1024;

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({ meta: [{ title: "Documents — LodgeMaster" }, { name: "description", content: "Upload your required documents." }] }),
  component: Docs,
});

function Docs() {
  const { booking, reload } = useCurrentBooking();
  const nav = useNavigate();
  const [docs, setDocs] = useState<Record<string, any>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data } = await supabase.from("documents").select("*").eq("user_id", u.user.id);
    const map: Record<string, any> = {};
    (data ?? []).forEach((d) => { map[d.doc_type] = d; });
    setDocs(map);
  };
  useEffect(() => { load(); }, []);

  const upload = async (key: string, file: File) => {
    if (!ALLOWED.includes(file.type)) return toast.error("Only PDF, PNG, JPEG allowed.");
    if (file.size > MAX) return toast.error("Max file size is 10 MB.");
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    setUploading(key); setProgress(30);
    const path = `${u.user.id}/${key}-${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("documents").upload(path, file, { upsert: true });
    setProgress(70);
    if (upErr) { setUploading(null); return toast.error(upErr.message); }
    // Remove previous of same type
    if (docs[key]) {
      await supabase.storage.from("documents").remove([docs[key].file_path]);
      await supabase.from("documents").delete().eq("id", docs[key].id);
    }
    const { error: insErr } = await supabase.from("documents").insert({
      user_id: u.user.id, booking_id: booking?.id ?? null, doc_type: key,
      file_path: path, file_name: file.name, mime_type: file.type,
    });
    setProgress(100);
    if (insErr) { setUploading(null); return toast.error(insErr.message); }
    toast.success("Uploaded");
    setUploading(null); setProgress(0);
    load();
  };

  const remove = async (key: string) => {
    const d = docs[key]; if (!d) return;
    await supabase.storage.from("documents").remove([d.file_path]);
    await supabase.from("documents").delete().eq("id", d.id);
    load();
  };

  const cont = async () => {
    if (!booking) return;
    if (DOC_TYPES.some((d) => !docs[d.key])) return toast.error("Please upload all documents.");
    await supabase.from("bookings").update({ status: "pending_room" }).eq("id", booking.id);
    await reload();
    toast.success("Documents received. Please pick your room.");
    nav({ to: "/select-room" });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Upload Documents</h1>
        <p className="text-muted-foreground mt-1">PDF, PNG, or JPEG · Max 10 MB each</p>
      </div>

      <DeadlineCountdown deadline={booking?.documents_deadline} label="Document upload deadline" />



      <div className="grid gap-4">
        {DOC_TYPES.map((d) => {
          const existing = docs[d.key];
          return (
            <Card key={d.key} className="border-border/60">
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center justify-between">{d.label}{existing && <FileCheck2 className="h-4 w-4 text-success"/>}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {existing && (
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                    <span className="text-sm truncate">{existing.file_name}</span>
                    <Button variant="ghost" size="icon" onClick={() => remove(d.key)}><Trash2 className="h-4 w-4"/></Button>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => e.target.files?.[0] && upload(d.key, e.target.files[0])} disabled={uploading === d.key} />
                  <Upload className="h-4 w-4 text-muted-foreground"/>
                </div>
                {uploading === d.key && <Progress value={progress} />}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Link to="/dashboard"><Button variant="outline">Save & exit</Button></Link>
        <Button onClick={cont}>Continue</Button>
      </div>
    </div>
  );
}
