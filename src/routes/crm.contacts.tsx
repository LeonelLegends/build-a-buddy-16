import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  PIPELINE_STAGES,
  PRIORITY_STYLES,
  type CrmLead,
  type PipelineStage,
  type Priority,
} from "@/lib/crm";
import { useTemplates } from "@/hooks/use-templates";
import { QuickActions } from "@/components/crm/QuickActions";

export const Route = createFileRoute("/crm/contacts")({
  component: ContactsPage,
});

type Note = { id: string; body: string; created_at: string };

function ContactsPage() {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<PipelineStage | "All">("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { templates } = useTemplates();

  const loadLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setLeads((data ?? []) as CrmLead[]);
    setLoading(false);
  };

  useEffect(() => { loadLeads(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (stageFilter !== "All" && l.pipeline_status !== stageFilter) return false;
      if (!q) return true;
      return [l.name, l.email, l.phone, l.insurance_type].some((v) => v?.toLowerCase().includes(q));
    });
  }, [leads, search, stageFilter]);

  const selected = leads.find((l) => l.id === selectedId) ?? null;

  const updateLead = (updated: CrmLead) => {
    setLeads((ls) => ls.map((l) => (l.id === updated.id ? updated : l)));
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Contacts</h1>
          <p className="mt-1 text-sm text-slate-600">All leads stored in your database.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search name, email, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-64 pl-8"
            />
          </div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as PipelineStage | "All")}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="All">All stages</option>
            {PIPELINE_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Insurance</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-slate-500">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-slate-500">No leads found.</td></tr>
            ) : filtered.map((lead) => (
              <tr key={lead.id} onClick={() => setSelectedId(lead.id)} className="cursor-pointer hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{lead.name}</td>
                <td className="px-4 py-3 text-slate-600">{lead.email}</td>
                <td className="px-4 py-3 text-slate-600">{lead.phone ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{lead.insurance_type ?? lead.interest ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{lead.pipeline_status}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${PRIORITY_STYLES[lead.priority]}`}>{lead.priority}</span>
                </td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <QuickActions lead={lead} templates={templates} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <LeadDrawer
              lead={selected}
              templates={templates}
              onUpdated={updateLead}
              onClose={() => setSelectedId(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function LeadDrawer({
  lead,
  templates,
  onUpdated,
  onClose,
}: {
  lead: CrmLead;
  templates: ReturnType<typeof useTemplates>["templates"];
  onUpdated: (l: CrmLead) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    age: lead.age ?? "",
    phone: lead.phone ?? "",
    email: lead.email,
    smoker: lead.smoker,
    beneficiaries: lead.beneficiaries ?? "",
    pipeline_status: lead.pipeline_status,
    priority: lead.priority,
    insurance_type: lead.insurance_type ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("lead_notes")
        .select("id, body, created_at")
        .eq("lead_id", lead.id)
        .order("created_at", { ascending: false });
      setNotes((data ?? []) as Note[]);
    })();
  }, [lead.id]);

  const save = async () => {
    setSaving(true);
    const payload = {
      age: form.age === "" ? null : Number(form.age),
      phone: form.phone || null,
      email: form.email,
      smoker: form.smoker,
      beneficiaries: form.beneficiaries || null,
      pipeline_status: form.pipeline_status,
      priority: form.priority,
      insurance_type: form.insurance_type || null,
    };
    const { data, error } = await supabase
      .from("leads")
      .update(payload)
      .eq("id", lead.id)
      .select("*")
      .single();
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    onUpdated(data as CrmLead);
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    setSavingNote(true);
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase
      .from("lead_notes")
      .insert({ lead_id: lead.id, body: newNote.trim(), author_id: session?.user.id ?? null })
      .select("id, body, created_at")
      .single();
    setSavingNote(false);
    if (error) return toast.error(error.message);
    setNotes((ns) => [data as Note, ...ns]);
    setNewNote("");
  };

  return (
    <div className="space-y-6">
      <SheetHeader>
        <div className="flex items-start justify-between">
          <div>
            <SheetTitle className="text-xl">{lead.name}</SheetTitle>
            <p className="mt-1 text-xs text-slate-500">Lead since {new Date(lead.created_at).toLocaleDateString()}</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
      </SheetHeader>

      <div className="rounded-lg bg-slate-50 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Quick contact</p>
        <QuickActions lead={lead} templates={templates} size="md" />
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Contact information</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Age"><Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></Field>
          <Field label="Insurance type"><Input value={form.insurance_type} onChange={(e) => setForm({ ...form, insurance_type: e.target.value })} /></Field>
          <Field label="Pipeline stage">
            <select value={form.pipeline_status} onChange={(e) => setForm({ ...form, pipeline_status: e.target.value as PipelineStage })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              {PIPELINE_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Priority">
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              {(["Low","Medium","High"] as Priority[]).map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Smoker">
            <label className="flex h-9 items-center gap-2 text-sm">
              <input type="checkbox" checked={form.smoker} onChange={(e) => setForm({ ...form, smoker: e.target.checked })} />
              {form.smoker ? "Yes" : "No"}
            </label>
          </Field>
        </div>
        <Field label="Beneficiaries">
          <Textarea rows={2} value={form.beneficiaries} onChange={(e) => setForm({ ...form, beneficiaries: e.target.value })} />
        </Field>
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Communication history</h3>
        <div className="space-y-2">
          <Textarea
            rows={3}
            placeholder="Add a note (call summary, follow-up, etc.)"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={addNote} disabled={savingNote || !newNote.trim()}>
              {savingNote ? "Adding…" : "Add note"}
            </Button>
          </div>
        </div>
        <ol className="space-y-3 border-l-2 border-slate-200 pl-4">
          {notes.length === 0 ? (
            <li className="text-sm text-slate-500">No notes yet.</li>
          ) : notes.map((n) => (
            <li key={n.id} className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-slate-900" />
              <p className="text-xs text-slate-500">{new Date(n.created_at).toLocaleString()}</p>
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-800">{n.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
