import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, GraduationCap, Briefcase, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { BackButton } from "@/components/back-button";

const searchSchema = z.object({
  mode: z.enum(["login", "register", "forgot"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — LodgeMaster" },
      { name: "description", content: "Sign in or create your LodgeMaster account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const initialTab = search.mode === "register" ? "register" : search.mode === "forgot" ? "forgot" : "login";

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background relative">
      <div className="absolute top-4 left-4 z-20">
        <BackButton />
      </div>
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary via-primary to-primary/70 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_50%)]" />
        <Link to="/" className="relative flex items-center gap-2 font-semibold text-lg">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur">
            <Building2 className="h-5 w-5" />
          </div>
          LodgeMaster
        </Link>
        <div className="relative">
          <h2 className="text-4xl font-bold leading-tight">Your hostel, one click away.</h2>
          <p className="mt-4 text-primary-foreground/80 max-w-md">
            The modern way to book, pay for, and manage your student accommodation.
          </p>
        </div>
        <div className="relative text-sm text-primary-foreground/70">© {new Date().getFullYear()} LodgeMaster</div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <Tabs defaultValue={initialTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="forgot">Reset</TabsTrigger>
            </TabsList>
            <TabsContent value="login"><LoginForm onDone={() => navigate({ to: "/dashboard" })} /></TabsContent>
            <TabsContent value="register"><RegisterFlow onDone={() => navigate({ to: "/dashboard" })} /></TabsContent>
            <TabsContent value="forgot"><ForgotForm /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Welcome back!"); onDone(); }
  };
  return (
    <Card className="mt-4 border-border/60">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your LodgeMaster account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2"><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-2"><Label>Password</Label><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <Button className="w-full" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ForgotForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Check your email for a reset link.");
  };
  return (
    <Card className="mt-4 border-border/60">
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>We'll email you a link to set a new password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2"><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <Button className="w-full" disabled={busy}>{busy ? "Sending..." : "Send reset link"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function RegisterFlow({ onDone }: { onDone: () => void }) {
  const [type, setType] = useState<"student" | "nss" | null>(null);
  if (!type) {
    return (
      <Card className="mt-4 border-border/60">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>First, choose your account type.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <button onClick={() => setType("student")} className="group flex items-center gap-4 rounded-xl border border-border p-4 text-left hover:border-primary hover:bg-primary-soft transition">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary-soft text-primary group-hover:bg-primary group-hover:text-primary-foreground transition"><GraduationCap className="h-5 w-5"/></div>
            <div><div className="font-semibold">Student</div><div className="text-sm text-muted-foreground">Enrolled at an institution.</div></div>
          </button>
          <button onClick={() => setType("nss")} className="group flex items-center gap-4 rounded-xl border border-border p-4 text-left hover:border-primary hover:bg-primary-soft transition">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary-soft text-primary group-hover:bg-primary group-hover:text-primary-foreground transition"><Briefcase className="h-5 w-5"/></div>
            <div><div className="font-semibold">NSS Personnel</div><div className="text-sm text-muted-foreground">Currently on national service.</div></div>
          </button>
          <p className="text-xs text-muted-foreground text-center mt-2">Hostel Manager accounts are created by the system administrator.</p>
        </CardContent>
      </Card>
    );
  }
  return <RegisterForm type={type} onBack={() => setType(null)} onDone={onDone} />;
}

function RegisterForm({ type, onBack, onDone }: { type: "student" | "nss"; onBack: () => void; onDone: () => void }) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Passwords do not match."); return; }
    if ((form.password || "").length < 6) { toast.error("Password must be at least 6 characters."); return; }
    setBusy(true);
    const meta: Record<string, string> = {
      account_type: type,
      full_name: form.full_name || "",
      phone: form.phone || "",
    };
    if (type === "student") {
      meta.institution = form.institution || "";
      meta.student_id = form.student_id || "";
      meta.programme = form.programme || "";
      meta.level = form.level || "";
    } else {
      meta.institution_graduated = form.institution_graduated || "";
      meta.nss_number = form.nss_number || "";
      meta.service_year = form.service_year || "";
      meta.place_of_posting = form.place_of_posting || "";
    }
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: meta, emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Account created!"); onDone(); }
  };

  return (
    <Card className="mt-4 border-border/60">
      <CardHeader>
        <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"><ArrowLeft className="h-4 w-4"/> Change type</button>
        <CardTitle>{type === "student" ? "Student registration" : "NSS Personnel registration"}</CardTitle>
        <CardDescription>Fill in your details to create an account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={submit}>
          <Field label="Full Name" name="full_name" onChange={upd("full_name")} required />
          <Field label="Email" name="email" type="email" onChange={upd("email")} required />
          <Field label="Phone Number" name="phone" onChange={upd("phone")} required />
          {type === "student" ? <>
            <Field label="Institution" name="institution" onChange={upd("institution")} required />
            <Field label="Student ID" name="student_id" onChange={upd("student_id")} required />
            <Field label="Programme" name="programme" onChange={upd("programme")} required />
            <Field label="Level" name="level" onChange={upd("level")} required />
          </> : <>
            <Field label="Institution Graduated" name="institution_graduated" onChange={upd("institution_graduated")} required />
            <Field label="NSS Number" name="nss_number" onChange={upd("nss_number")} required />
            <Field label="Service Year" name="service_year" onChange={upd("service_year")} required />
            <Field label="Place of Posting" name="place_of_posting" onChange={upd("place_of_posting")} required />
          </>}
          <Field label="Password" name="password" type="password" onChange={upd("password")} required />
          <Field label="Confirm Password" name="confirm" type="password" onChange={upd("confirm")} required />
          <div className="sm:col-span-2 mt-2">
            <Button className="w-full" disabled={busy}>{busy ? "Creating account..." : "Create account"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, name, type = "text", onChange, required }: { label: string; name: string; type?: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required={required} onChange={onChange} />
    </div>
  );
}
