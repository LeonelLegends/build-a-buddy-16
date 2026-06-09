## Root cause

Login itself is working — the auth logs show `leonel@legendsinsuranceservices.com` signing in with HTTP 200, and signup for `leonel.matheus@gmail.com` also succeeds (HTTP 200). The "Not authorized" screen you see comes **after** login, from the CRM page's admin check.

When that page loads, the browser calls:

```
GET /rest/v1/user_roles?select=role&user_id=eq.<your-id>&role=eq.admin
```

The database rejects it with:

```
403 — permission denied for function has_role
```

A previous security migration (`20260607230945_…`) revoked `EXECUTE` on `public.has_role(uuid, app_role)` from both `anon` and `authenticated`. But every RLS policy on `user_roles`, `leads`, `lead_notes`, and `message_templates` calls `has_role(...)`. With execute revoked, those policies error out, so:

- The admin check returns "permission denied" → CRM shows **Not authorized**.
- Selecting/updating leads, notes, and templates also fails for any logged-in user.

So even though your account is correctly marked `admin` in `user_roles`, the policy that grants you access can no longer run.

## Fix

### 1. Restore `has_role` execute permission to authenticated users (migration)

`has_role` is a `SECURITY DEFINER` function that only reads `user_roles` and returns a boolean. It is safe to expose to authenticated users — that's the whole point of the helper, and every RLS policy depends on it.

```sql
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
```

This single change restores admin role checks, the CRM screen, lead listing, lead updates, notes, and template management.

### 2. Smoother admin onboarding for new signups

Right now, a brand-new signup lands on the dashboard and sees "Not authorized" because no one inserted a row into `user_roles`. There are also no policies allowing anyone to insert into `user_roles` from the app, so it can only be done by a database admin.

To make onboarding sane without weakening security:

- Add a one-time **bootstrap rule**: if `public.user_roles` is completely empty, the first authenticated signup automatically becomes `admin` via a `BEFORE INSERT` trigger on `auth.users` calling a `SECURITY DEFINER` function. After the first admin exists, the trigger does nothing.
- Add an admin-only **INSERT/DELETE policy** on `user_roles` so existing admins can promote/demote teammates from the CRM Settings page (UI work can come later if you want — out of scope for this plan; the policy alone unblocks ad-hoc grants via the database tools).
- Update the dashboard/CRM "Not authorized" screen with clearer copy: "Ask an existing admin to grant you the admin role" (already mostly present on dashboard, missing on CRM page — add it there too).

Bootstrap function sketch:

```sql
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER bootstrap_first_admin_trigger
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.bootstrap_first_admin();
```

Admin-managed role policies:

```sql
CREATE POLICY "Admins can grant roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can revoke roles" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
```

## What will change

- 1 migration containing the `GRANT EXECUTE`, the bootstrap function + trigger, and the two admin-role policies.
- 1 small UI tweak in `src/routes/crm.tsx` so the "Not authorized" message explains how to get access.

## What I'm not changing

- Your existing admin role for `leonel@legendsinsuranceservices.com` (already correct).
- Auth settings (`auto_confirm_email` stays on).
- Any business logic, page layouts, or CRM functionality.

## About the deducted credits

Build mode credits are usage-based per action, including ones that don't end up solving the bug. The previous turn did successfully run the migrations it described (the user account is confirmed in the database, which you can see in the auth response), but it stopped one root-cause hop short of what was actually blocking your access. That's why login works yet CRM still says "Not authorized."

For a refund or credit adjustment, Lovable doesn't process refunds via chat — please contact support at https://lovable.dev/support with this conversation; they can review the case.

<presentation-actions>
<presentation-link url="https://lovable.dev/support">Contact Lovable support about credits</presentation-link>
</presentation-actions>
