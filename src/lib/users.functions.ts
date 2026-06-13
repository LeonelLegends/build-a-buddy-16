import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Role = "admin" | "user" | "master";

// Validates password strength per project rules.
function validatePassword(pw: string): string | null {
  if (typeof pw !== "string" || pw.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(pw)) return "Password must include an uppercase letter";
  if (!/[a-z]/.test(pw)) return "Password must include a lowercase letter";
  if (!/[0-9]/.test(pw)) return "Password must include a number";
  if (!/[*\-#@]/.test(pw)) return "Password must include one of these symbols: * - # @";
  return null;
}

async function assertCallerRole(userId: string, needMaster: boolean) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  const roles = new Set((data ?? []).map((r) => r.role as Role));
  const isMaster = roles.has("master");
  const isAdmin = roles.has("admin") || isMaster;
  if (needMaster && !isMaster) throw new Error("Forbidden: master only");
  if (!needMaster && !isAdmin) throw new Error("Forbidden: admin only");
  return { isMaster, isAdmin };
}

// Public: check whether an email is registered (used by the login page).
export const checkEmailRegistered = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string }) => {
    const email = String(input?.email ?? "").trim().toLowerCase();
    if (!email || email.length > 320) throw new Error("Invalid email");
    return { email };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Paginate through users; admin API doesn't expose direct lookup-by-email.
    let page = 1;
    const perPage = 200;
    while (page <= 25) {
      const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
      if (error) throw new Error(error.message);
      const found = list.users.some((u) => (u.email ?? "").toLowerCase() === data.email);
      if (found) return { registered: true };
      if (list.users.length < perPage) break;
      page += 1;
    }
    return { registered: false };
  });

// List all users with roles (admin or master).
export const listManagedUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertCallerRole(context.userId, false);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const users: { id: string; email: string; created_at: string; roles: Role[] }[] = [];
    let page = 1;
    const perPage = 200;
    while (page <= 25) {
      const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
      if (error) throw new Error(error.message);
      for (const u of list.users) {
        users.push({ id: u.id, email: u.email ?? "", created_at: u.created_at, roles: [] });
      }
      if (list.users.length < perPage) break;
      page += 1;
    }
    const { data: roleRows, error: rolesErr } = await supabaseAdmin.from("user_roles").select("user_id, role");
    if (rolesErr) throw new Error(rolesErr.message);
    const byUser = new Map<string, Role[]>();
    for (const r of roleRows ?? []) {
      const arr = byUser.get(r.user_id) ?? [];
      arr.push(r.role as Role);
      byUser.set(r.user_id, arr);
    }
    for (const u of users) u.roles = byUser.get(u.id) ?? [];
    users.sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
    return { users, callerId: context.userId };
  });

// Set role to admin or user (toggle). Admin or master may call.
export const setUserAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; makeAdmin: boolean }) => {
    if (!input?.userId) throw new Error("userId required");
    return { userId: String(input.userId), makeAdmin: !!input.makeAdmin };
  })
  .handler(async ({ data, context }) => {
    await assertCallerRole(context.userId, false);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Protect master accounts from being demoted by non-master callers
    const { data: targetRoles } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", data.userId);
    const tRoles = new Set((targetRoles ?? []).map((r) => r.role as Role));
    if (tRoles.has("master")) {
      const caller = await assertCallerRole(context.userId, false);
      if (!caller.isMaster) throw new Error("Only a master can change another master");
    }

    if (data.makeAdmin) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.userId, role: "admin" }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles").delete().eq("user_id", data.userId).eq("role", "admin");
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// Toggle master role (master only).
export const setUserMasterRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; makeMaster: boolean }) => {
    if (!input?.userId) throw new Error("userId required");
    return { userId: String(input.userId), makeMaster: !!input.makeMaster };
  })
  .handler(async ({ data, context }) => {
    await assertCallerRole(context.userId, true);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.makeMaster) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.userId, role: "master" }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
      // ensure admin too
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.userId, role: "admin" }, { onConflict: "user_id,role" });
    } else {
      if (data.userId === context.userId) {
        // Don't allow last master to demote themselves
        const { data: masters } = await supabaseAdmin
          .from("user_roles").select("user_id").eq("role", "master");
        if ((masters ?? []).length <= 1) throw new Error("Cannot remove the last master");
      }
      const { error } = await supabaseAdmin
        .from("user_roles").delete().eq("user_id", data.userId).eq("role", "master");
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// Create a new user (master only).
export const createManagedUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string; password: string; makeAdmin?: boolean }) => {
    const email = String(input?.email ?? "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");
    const password = String(input?.password ?? "");
    const pwErr = validatePassword(password);
    if (pwErr) throw new Error(pwErr);
    return { email, password, makeAdmin: !!input?.makeAdmin };
  })
  .handler(async ({ data, context }) => {
    await assertCallerRole(context.userId, true);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (error || !created.user) throw new Error(error?.message ?? "Failed to create user");
    if (data.makeAdmin) {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: created.user.id, role: "admin" }, { onConflict: "user_id,role" });
    }
    return { ok: true, userId: created.user.id };
  });

// Delete a user (master only). For admins, fully delete; we just remove admin role per spec.
// Master deletion is blocked.
export const deleteManagedUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string }) => {
    if (!input?.userId) throw new Error("userId required");
    return { userId: String(input.userId) };
  })
  .handler(async ({ data, context }) => {
    await assertCallerRole(context.userId, true);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: targetRoles } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", data.userId);
    const tRoles = new Set((targetRoles ?? []).map((r) => r.role as Role));
    if (tRoles.has("master")) throw new Error("Cannot delete a master user");
    // Per spec: removing a user = revoke admin role (account stays).
    const { error } = await supabaseAdmin
      .from("user_roles").delete().eq("user_id", data.userId).eq("role", "admin");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Update a user's email (master only).
export const updateUserEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; email: string }) => {
    if (!input?.userId) throw new Error("userId required");
    const email = String(input?.email ?? "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");
    return { userId: String(input.userId), email };
  })
  .handler(async ({ data, context }) => {
    await assertCallerRole(context.userId, true);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      email: data.email,
      email_confirm: true,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Change own password (any signed-in user).
export const changeOwnPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { currentPassword: string; newPassword: string; repeatPassword: string }) => {
    const currentPassword = String(input?.currentPassword ?? "");
    const newPassword = String(input?.newPassword ?? "");
    const repeatPassword = String(input?.repeatPassword ?? "");
    if (!currentPassword) throw new Error("Current password required");
    if (newPassword !== repeatPassword) throw new Error("New passwords do not match");
    const pwErr = validatePassword(newPassword);
    if (pwErr) throw new Error(pwErr);
    return { currentPassword, newPassword };
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: userInfo, error: getErr } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    if (getErr || !userInfo.user?.email) throw new Error("Cannot load account");

    // Verify current password by attempting a sign-in with a separate client
    const { createClient } = await import("@supabase/supabase-js");
    const verifier = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: signInErr } = await verifier.auth.signInWithPassword({
      email: userInfo.user.email,
      password: data.currentPassword,
    });
    if (signInErr) throw new Error("Current password is incorrect");

    const { error } = await supabaseAdmin.auth.admin.updateUserById(context.userId, {
      password: data.newPassword,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
