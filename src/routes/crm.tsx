import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LayoutGrid, Users, Settings, LogOut, FileText, UserCog } from "lucide-react";

export const Route = createFileRoute("/crm")({
  head: () => ({
    meta: [
      { title: "CRM — Legends Insurance" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CrmLayout,
});

function CrmLayout() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate({ to: "/login" });
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .in("role", ["admin", "master"]);
      if (!mounted) return;
      setIsAdmin((data ?? []).length > 0);
      setChecked(true);
    })();
    return () => { mounted = false; };
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  if (!checked) {
    return <div className="p-12 text-center text-sm text-muted-foreground">Loading CRM…</div>;
  }
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md p-12 text-center">
        <h1 className="font-display text-2xl text-primary">Not authorized</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account does not have admin access. Ask an existing admin to grant the <code>admin</code> role to your user in the <code>user_roles</code> table.
        </p>
        <button onClick={signOut} className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Sign out</button>
      </div>
    );
  }

  type Item = { to: string; label: string; icon: typeof Settings; children: Item[] };
  const navItems: Item[] = [
    { to: "/crm/pipeline", label: "Pipeline", icon: LayoutGrid, children: [] },
    { to: "/crm/contacts", label: "Contacts", icon: Users, children: [] },
    { to: "/crm/blog", label: "Blog", icon: FileText, children: [] },
    {
      to: "/crm/settings",
      label: "Settings",
      icon: Settings,
      children: [{ to: "/crm/users", label: "Users", icon: UserCog, children: [] }],
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b border-slate-200 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Legends CRM</p>
          <p className="mt-1 text-sm text-slate-900">Agent Workspace</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(({ to, label, icon: Icon, children }) => (
            <div key={to}>
              <Link
                to={to as any}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                activeProps={{ className: "bg-slate-900 text-white hover:bg-slate-900" }}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
              {children.length > 0 && (
                <div className="ml-7 mt-1 space-y-1 border-l border-slate-200 pl-2">
                  {children.map((c) => (
                    <Link
                      key={c.to}
                      to={c.to as any}
                      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                      activeProps={{ className: "bg-slate-900 text-white hover:bg-slate-900" }}
                    >
                      <c.icon className="h-3.5 w-3.5" />
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          {navItems.flatMap(({ to, label, children }) => [
            <Link key={to} to={to as any} className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium text-slate-700" activeProps={{ className: "bg-slate-900 text-white" }}>{label}</Link>,
            ...children.map((c) => (
              <Link key={c.to} to={c.to as any} className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium text-slate-600" activeProps={{ className: "bg-slate-900 text-white" }}>{c.label}</Link>
            )),
          ])}
        </div>
        <Outlet />
      </main>
    </div>
  );
}
