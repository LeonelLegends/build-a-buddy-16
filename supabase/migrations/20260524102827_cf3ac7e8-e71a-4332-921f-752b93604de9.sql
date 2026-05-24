
-- Enums
CREATE TYPE public.lead_priority AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE public.pipeline_stage AS ENUM ('New Lead', 'Appointment Scheduled', 'Proposal Sent', 'Sales Closed', 'Future Follow-up');
CREATE TYPE public.message_channel AS ENUM ('whatsapp', 'email', 'sms');

-- Extend leads
ALTER TABLE public.leads
  ADD COLUMN age int,
  ADD COLUMN insurance_type text,
  ADD COLUMN priority public.lead_priority NOT NULL DEFAULT 'Medium',
  ADD COLUMN smoker boolean NOT NULL DEFAULT false,
  ADD COLUMN beneficiaries text,
  ADD COLUMN pipeline_status public.pipeline_stage NOT NULL DEFAULT 'New Lead',
  ADD COLUMN position int NOT NULL DEFAULT 0;

-- lead_notes
CREATE TABLE public.lead_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  author_id uuid,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view notes" ON public.lead_notes
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert notes" ON public.lead_notes
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update notes" ON public.lead_notes
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete notes" ON public.lead_notes
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- message_templates
CREATE TABLE public.message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel public.message_channel NOT NULL UNIQUE,
  name text NOT NULL,
  body text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view templates" ON public.message_templates
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert templates" ON public.message_templates
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update templates" ON public.message_templates
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admins can also delete/insert leads (insert already exists publicly; add admin INSERT not needed)
-- Seed default templates
INSERT INTO public.message_templates (channel, name, body) VALUES
  ('whatsapp', 'WhatsApp Greeting', 'Hello {{name}}, I''m your insurance advisor. I wanted to follow up about your life insurance options. When would be a good time to chat?'),
  ('email', 'Email Follow-up', 'Hi {{name}},

Thank you for your interest in life insurance. I''d love to schedule a quick call to discuss the best coverage options for you and your family.

Best regards,
Your Insurance Advisor'),
  ('sms', 'SMS Quick Note', 'Hi {{name}}, this is your insurance advisor. Got a minute to talk about your coverage options?');

-- Index for kanban ordering
CREATE INDEX idx_leads_pipeline ON public.leads(pipeline_status, position);
