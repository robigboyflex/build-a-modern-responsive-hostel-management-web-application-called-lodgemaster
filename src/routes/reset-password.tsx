import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Set new password — LodgeMaster" }, { name: "description", content: "Choose a new password for your LodgeMaster account." }],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== confirm) return toast.error("Passwords do not match");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Password updated"); navigate({ to: "/dashboard" }); }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-background">
      <Card className="w-full max-w-md border-border/60">
        <CardHeader>
          <CardTitle>Set a new password</CardTitle>
          <CardDescription>Enter and confirm your new password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2"><Label>New password</Label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Confirm password</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></div>
            <Button className="w-full" disabled={busy}>{busy ? "Updating..." : "Update password"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
