import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Mail, Phone } from "lucide-react";

type LeadStatus = "New" | "Pending" | "Closed";
type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  interest: string | null;
  message: string | null;
  status: LeadStatus;
  created_at: string;
};

const STATUSES: LeadStatus[] = ["New", "Pending", "Closed"];

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Leads Dashboard — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LeadStatus | "All">("All");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate({ to: "/login" });
        return;
      }
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!mounted) return;
      setIsAdmin(!!roleRow);
      setAuthChecked(true);
    })();
    return () => { mounted = false; };
  }, [navigate]);

  useEffect(() => {
    if (!authChecked || !isAdmin) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      else setLeads((data ?? []) as Lead[]);
      setLoading(false);
    })();
  }, [authChecked, isAdmin]);

  const filtered = useMemo(
    () => (filter === "All" ? leads : leads.filter((l) => l.status === filter)),
    [leads, filter],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: leads.length, New: 0, Pending: 0, Closed: 0 };
    leads.forEach((l) => { c[l.status] = (c[l.status] ?? 0) + 1; });
    return c;
  }, [leads]);

  const updateStatus = async (id: string, status: LeadStatus) => {
    const prev = leads;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) {
      setLeads(prev);
      toast.error("Could not update status");
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  if (!authChecked) {
    return <div className="mx-auto max-w-7xl px-6 py-24 text-center text-muted-foreground">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <section className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-primary">Not authorized</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account does not have admin access. Ask an existing admin to grant the <code>admin</code> role to your user in the <code>user_roles</code> table.
        </p>
        <button onClick={signOut} className="mt-6 rounded-md bg-gradient-gold px-4 py-2 text-sm font-semibold text-primary">
          Sign out
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gold">Admin</span>
          <h1 className="mt-1 font-display text-3xl text-primary">Leads</h1>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/crm/pipeline"
            className="inline-flex items-center gap-2 rounded-md bg-gradient-gold px-3 py-2 text-sm font-semibold text-primary shadow-gold"
          >
            Open CRM →
          </a>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["All", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              filter === s
                ? "border-gold bg-gradient-gold text-primary shadow-gold"
                : "border-border bg-card text-foreground/70 hover:text-primary"
            }`}
          >
            {s} <span className="ml-1 text-xs opacity-70">({counts[s] ?? 0})</span>
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Loading leads...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No leads in this view.</div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((lead) => (
              <li key={lead.id} className="grid gap-3 p-5 md:grid-cols-[1fr_auto] md:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold text-primary">{lead.name}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(lead.created_at).toLocaleString()}
                    </span>
                    {lead.interest && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{lead.interest}</span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-foreground/80">
                    <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                      <Mail className="h-3.5 w-3.5" /> {lead.email}
                    </a>
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                        <Phone className="h-3.5 w-3.5" /> {lead.phone}
                      </a>
                    )}
                  </div>
                  {lead.message && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/70">{lead.message}</p>
                  )}
                </div>
                <select
                  value={lead.status}
                  onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
