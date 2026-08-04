import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ShieldAlert, ShieldCheck, KeyRound, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  listStaffAccounts,
  createManagerAccount,
  revokeManagerAccess,
  resetManagerPassword,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/managers")({
  head: () => ({
    meta: [
      { title: "Manager Provisioning — LodgeMaster Admin" },
      { name: "description", content: "System Administrator console for creating and managing Hostel Manager accounts." },
      { property: "og:title", content: "Manager Provisioning — LodgeMaster Admin" },
      { property: "og:description", content: "Create, reset and revoke Hostel Manager accounts from the administrator console." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminManagers,
});

function randomPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  return Array.from({ length: 14 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function AdminManagers() {
  const { roles, loading } = useAuth();
  const isAdmin = roles.includes("admin");

  const list = useServerFn(listStaffAccounts);
  const create = useServerFn(createManagerAccount);
  const revoke = useServerFn(revokeManagerAccess);
  const reset = useServerFn(resetManagerPassword);
  const qc = useQueryClient();

  const staff = useQuery({
    queryKey: ["staff-accounts"],
    queryFn: () => list({}),
    enabled: isAdmin,
  });

  const [form, setForm] = useState({ email: "", full_name: "", phone: "", password: randomPassword() });

  const createMut = useMutation({
    mutationFn: () => create({ data: form }),
    onSuccess: () => {
      toast.success("Hostel Manager account created");
      setForm({ email: "", full_name: "", phone: "", password: randomPassword() });
      qc.invalidateQueries({ queryKey: ["staff-accounts"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not create account"),
  });

  const revokeMut = useMutation({
    mutationFn: (userId: string) => revoke({ data: { userId } }),
    onSuccess: () => {
      toast.success("Manager access revoked");
      qc.invalidateQueries({ queryKey: ["staff-accounts"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not revoke access"),
  });

  const resetMut = useMutation({
    mutationFn: (v: { userId: string; password: string }) => reset({ data: v }),
    onSuccess: (_d, v) => toast.success(`New password: ${v.password}`, { duration: 15000 }),
    onError: (e: any) => toast.error(e?.message ?? "Could not reset password"),
  });

  if (loading) return null;

  if (!isAdmin) {
    return (
      <Card className="border-border/60 max-w-xl">
        <CardHeader className="flex-row items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-destructive" />
          <div>
            <CardTitle>Administrator only</CardTitle>
            <CardDescription>Hostel Manager accounts can only be provisioned by the System Administrator.</CardDescription>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manager Provisioning</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Hostel Manager accounts are created here only — they cannot be self-registered.
        </p>
      </div>

      <Card className="border-border/60 max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> New Hostel Manager</CardTitle>
          <CardDescription>The account is created confirmed and signed in with the password below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone (optional)</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Temporary password</Label>
              <div className="flex gap-2">
                <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <Button type="button" variant="outline" onClick={() => setForm({ ...form, password: randomPassword() })}>
                  <KeyRound className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}>
            {createMut.isPending ? "Creating…" : "Create manager account"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader><CardTitle>Staff accounts</CardTitle></CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left"><tr className="[&>th]:p-3"><th>Name</th><th>Email</th><th>Roles</th><th></th></tr></thead>
            <tbody>
              {(staff.data ?? []).map((s: any) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="p-3 font-medium">{s.full_name}</td>
                  <td className="p-3 text-muted-foreground">{s.email}</td>
                  <td className="p-3 space-x-1">
                    {s.roles.map((r: string) => <Badge key={r} variant={r === "admin" ? "default" : "secondary"}>{r}</Badge>)}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resetMut.mutate({ userId: s.id, password: randomPassword() })}
                    >
                      <KeyRound className="h-4 w-4 mr-1" />Reset password
                    </Button>
                    {s.roles.includes("manager") && (
                      <Button size="sm" variant="ghost" onClick={() => revokeMut.mutate(s.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {staff.isSuccess && (staff.data ?? []).length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No manager or admin accounts yet.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
