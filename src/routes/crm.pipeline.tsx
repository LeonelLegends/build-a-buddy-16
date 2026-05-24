import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  PIPELINE_STAGES,
  PRIORITY_STYLES,
  STAGE_COLORS,
  type CrmLead,
  type PipelineStage,
} from "@/lib/crm";
import { useTemplates } from "@/hooks/use-templates";
import { QuickActions } from "@/components/crm/QuickActions";
import { GripVertical } from "lucide-react";

export const Route = createFileRoute("/crm/pipeline")({
  component: PipelinePage,
});

function PipelinePage() {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [loading, setLoading] = useState(true);
  const { templates } = useTemplates();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("pipeline_status")
        .order("position", { ascending: true });
      if (error) toast.error(error.message);
      else setLeads((data ?? []) as CrmLead[]);
      setLoading(false);
    })();
  }, []);

  const byStage = useMemo(() => {
    const map: Record<PipelineStage, CrmLead[]> = {
      "New Lead": [], "Appointment Scheduled": [], "Proposal Sent": [], "Sales Closed": [], "Future Follow-up": [],
    };
    for (const l of leads) map[l.pipeline_status].push(l);
    return map;
  }, [leads]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragEnd = async (e: DragEndEvent) => {
    const leadId = String(e.active.id);
    const targetStage = e.over?.id as PipelineStage | undefined;
    if (!targetStage || !PIPELINE_STAGES.includes(targetStage)) return;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.pipeline_status === targetStage) return;
    const prev = leads;
    setLeads((ls) => ls.map((l) => (l.id === leadId ? { ...l, pipeline_status: targetStage } : l)));
    const { error } = await supabase
      .from("leads")
      .update({ pipeline_status: targetStage })
      .eq("id", leadId);
    if (error) {
      setLeads(prev);
      toast.error("Could not move card");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Opportunity Pipeline</h1>
        <p className="mt-1 text-sm text-slate-600">Drag cards between stages to update their status.</p>
      </div>

      {loading ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">Loading leads…</div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {PIPELINE_STAGES.map((stage) => (
              <Column key={stage} stage={stage} leads={byStage[stage]} templates={templates} />
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}

function Column({ stage, leads, templates }: { stage: PipelineStage; leads: CrmLead[]; templates: ReturnType<typeof useTemplates>["templates"] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className={`rounded-t-lg border-t-4 px-3 py-2.5 ${STAGE_COLORS[stage]}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">{stage}</h3>
          <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-slate-700">{leads.length}</span>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 rounded-b-lg border border-t-0 border-slate-200 bg-slate-50/60 p-2 min-h-[300px] ${isOver ? "bg-slate-100" : ""}`}
      >
        {leads.map((lead) => (
          <Card key={lead.id} lead={lead} templates={templates} />
        ))}
        {leads.length === 0 && (
          <div className="rounded-md border border-dashed border-slate-300 p-4 text-center text-xs text-slate-400">No leads</div>
        )}
      </div>
    </div>
  );
}

function Card({ lead, templates }: { lead: CrmLead; templates: ReturnType<typeof useTemplates>["templates"] }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:shadow ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{lead.name}</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">{lead.insurance_type ?? lead.interest ?? "—"}</p>
        </div>
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing"
          aria-label="Drag"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${PRIORITY_STYLES[lead.priority]}`}>
          {lead.priority}
        </span>
        <QuickActions lead={lead} templates={templates} />
      </div>
    </div>
  );
}
