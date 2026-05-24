## CRM Build Plan for Life Insurance Agent

A full CRM layered on top of the existing site, protected behind the existing Supabase Auth (`/login`) and admin role. All CRM routes live under `/crm/*` and require the `admin` role (reusing the `has_role` + `user_roles` pattern already in the project).

---

### 1. Database (Supabase migration)

Extend the existing `leads` table and add supporting tables:

**`leads` — add columns:**
- `age` (int, nullable)
- `insurance_type` (text, nullable) — e.g. "Term Life", "Whole Life", "IUL"
- `priority` (enum `lead_priority`: `Low`, `Medium`, `High`, default `Medium`)
- `smoker` (boolean, default false)
- `beneficiaries` (text, nullable)
- `pipeline_status` (enum `pipeline_stage`: `New Lead`, `Appointment Scheduled`, `Proposal Sent`, `Sales Closed`, `Future Follow-up`, default `New Lead`)
- `position` (int, default 0) — for ordering inside a Kanban column

The existing `status` (`New`/`Pending`/`Closed`) stays for backward compatibility with the marketing contact form.

**New table `lead_notes`:**
- `id`, `lead_id` (FK leads), `author_id` (uuid), `body` (text), `created_at`

**New table `message_templates`:**
- `id`, `channel` (enum: `whatsapp`, `email`, `sms`), `name`, `body`, `updated_at`
- Body supports `{{name}}` placeholder.

**RLS:** all CRM tables admin-only via `has_role(auth.uid(), 'admin')`. Public contact-form INSERT on `leads` stays as-is.

Seed three default templates (whatsapp / email / sms).

---

### 2. Routes (TanStack)

- `/crm` — layout, requires admin (reuses dashboard's auth check pattern), sidebar nav.
- `/crm/pipeline` — Kanban board.
- `/crm/contacts` — table of leads + side drawer on row click.
- `/crm/settings` — edit message templates.

The existing `/dashboard` (marketing leads inbox) stays untouched. Add a link from it to `/crm`.

---

### 3. Pipeline (Kanban)

- 5 columns matching `pipeline_stage` enum.
- Drag & drop via `@dnd-kit/core` + `@dnd-kit/sortable` (install).
- Card shows: Name, Insurance Type, priority badge (colored), and 3 quick-action icons (WhatsApp / Email / SMS).
- Drop updates `pipeline_status` + `position` in Supabase, optimistic UI.

---

### 4. Contacts table + side drawer

- shadcn `Table` listing all leads with filters (search by name/email, filter by pipeline stage).
- Click row → shadcn `Sheet` (side drawer) with:
  - **Contact info:** name, email, phone, age, smoker Y/N, beneficiaries (editable inline, save button).
  - **Communication History:** timeline of `lead_notes`, with a textarea to add a new note.
  - Quick action buttons (WhatsApp / Email / SMS) at top.

---

### 5. Direct Communication

Quick-action buttons (on cards + drawer) using stored templates with `{{name}}` substitution:

- **WhatsApp:** opens `https://wa.me/<phone>?text=<encoded template>` in new tab (no API, no connector required).
- **SMS:** opens `sms:<phone>?body=<encoded template>`.
- **Email:** server function via Resend connector to send email using the email template. Requires connecting Resend — I'll wire the server function and surface a clear "Connect Resend" message if the API key isn't set yet, so the rest of the CRM works immediately.

---

### 6. Settings

`/crm/settings` page with three forms (one per channel) to edit the templates. Saves to `message_templates`.

---

### 7. Tech notes

- New deps: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
- All CRM reads/writes go through the browser Supabase client under admin RLS (matches the existing `/dashboard` pattern — no server functions needed except for Resend email send).
- Design: clean GHL-style — light surfaces, subtle borders, colored pipeline column headers, priority badges (green/amber/red).

---

### What I need from you

1. **Resend email sending** — do you want me to wire it now (you'll need to connect Resend afterwards), or skip server-side email for v1 and use `mailto:` links like SMS/WhatsApp?
2. Confirm the CRM should be **admin-only** (same role as `/dashboard`), not a separate role.

If you just say "go", I'll proceed with: Resend wired but optional (mailto fallback if not connected), admin-only access.