import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error("Could not verify administrator access");
  if (!data) throw new Error("Forbidden: system administrator access required");
}

export const listStaffAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: roleRows, error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role, created_at")
      .in("role", ["manager", "admin"]);
    if (roleErr) throw new Error(roleErr.message);

    const ids = [...new Set((roleRows ?? []).map((r) => r.user_id))];
    if (ids.length === 0) return [];

    const { data: profiles, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, phone, created_at")
      .in("id", ids);
    if (pErr) throw new Error(pErr.message);

    return ids.map((id) => {
      const p = profiles?.find((x) => x.id === id);
      return {
        id,
        full_name: p?.full_name ?? "—",
        email: p?.email ?? "—",
        phone: p?.phone ?? null,
        created_at: p?.created_at ?? null,
        roles: (roleRows ?? []).filter((r) => r.user_id === id).map((r) => r.role as string),
      };
    });
  });

const createSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(2).max(120),
  phone: z.string().max(40).optional().or(z.literal("")),
  password: z.string().min(8).max(72),
});

export const createManagerAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.full_name,
        account_type: "manager",
        phone: data.phone || null,
      },
    });
    if (error) throw new Error(error.message);
    return { id: created.user?.id, email: data.email };
  });

export const revokeManagerAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    if (data.userId === (context as any).userId) throw new Error("You cannot revoke your own access");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", "manager");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const resetManagerPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ userId: z.string().uuid(), password: z.string().min(8).max(72) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.password,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
