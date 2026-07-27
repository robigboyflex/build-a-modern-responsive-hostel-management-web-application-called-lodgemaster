import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProfile } from "@/lib/hooks";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — LodgeMaster" }, { name: "description", content: "Manage your profile." }] }),
  component: Profile,
});

function Profile() {
  const { profile, loading, setProfile } = useProfile();
  const [phone, setPhone] = useState("");
  const [emg, setEmg] = useState("");
  const [addr, setAddr] = useState("");
  const [pw, setPw] = useState("");

  useEffect(() => {
    if (profile) { setPhone(profile.phone ?? ""); setEmg(profile.emergency_contact ?? ""); setAddr(profile.address ?? ""); }
  }, [profile]);

  if (loading) return <p>Loading...</p>;
  if (!profile) return <p>No profile found.</p>;

  const save = async () => {
    const { error } = await supabase.from("profiles").update({ phone, emergency_contact: emg, address: addr }).eq("id", profile.id);
    if (error) return toast.error(error.message);
    setProfile({ ...profile, phone, emergency_contact: emg, address: addr });
    toast.success("Profile updated");
  };

  const changePw = async () => {
    if (pw.length < 6) return toast.error("Password must be at least 6 characters");
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return toast.error(error.message);
    setPw(""); toast.success("Password updated");
  };

  const uploadAvatar = async (f: File) => {
    const path = `${profile.id}/avatar-${Date.now()}-${f.name}`;
    const { error } = await supabase.storage.from("avatars").upload(path, f, { upsert: true });
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", profile.id);
    setProfile({ ...profile, avatar_url: data.publicUrl });
    toast.success("Avatar updated");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h1 className="text-3xl font-bold">Profile</h1></div>

      <Card className="border-border/60">
        <CardHeader><CardTitle>Account details (read-only)</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Read label="Name" v={profile.full_name}/>
          <Read label="Email" v={profile.email}/>
          <Read label="Account type" v={profile.account_type}/>
          <Read label="Institution" v={profile.institution ?? profile.institution_graduated ?? "—"}/>
          <Read label="Student ID / NSS Number" v={profile.student_id ?? profile.nss_number ?? "—"}/>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader><CardTitle>Editable info</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>Phone Number</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)}/></div>
          <div className="space-y-2"><Label>Emergency Contact</Label><Input value={emg} onChange={(e) => setEmg(e.target.value)}/></div>
          <div className="space-y-2 sm:col-span-2"><Label>Address</Label><Input value={addr} onChange={(e) => setAddr(e.target.value)}/></div>
          <div className="space-y-2 sm:col-span-2"><Label>Passport photo</Label><Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])}/></div>
          <div className="sm:col-span-2"><Button onClick={save}>Save changes</Button></div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
        <CardContent className="flex gap-2 items-end">
          <div className="space-y-2 flex-1"><Label>New password</Label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)}/></div>
          <Button onClick={changePw}>Update</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Read({ label, v }: { label: string; v: string }) {
  return <div><div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div><div className="mt-1 font-medium">{v}</div></div>;
}
