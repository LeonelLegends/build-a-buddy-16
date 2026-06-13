import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Pencil, X, Eye, Languages, Loader2 } from "lucide-react";
import { RichTextEditor } from "@/components/blog/RichTextEditor";
import { ImageUploader } from "@/components/blog/ImageUploader";
import { translateBlogToSpanish } from "@/lib/translate.functions";

type Post = {
  id: string;
  slug: string;
  title: string;
  title_es: string | null;
  summary: string;
  summary_es: string | null;
  author: string | null;
  cover: string | null;
  cover_path: string | null;
  body: string;
  body_es: string | null;
  published: boolean;
  published_at: string;
  view_count: number;
};

export const Route = createFileRoute("/crm/blog")({
  component: BlogAdmin,
});

const empty = {
  id: "",
  slug: "",
  title: "",
  title_es: "",
  summary: "",
  summary_es: "",
  author: "Legends Insurance Services",
  cover_path: "" as string | null,
  body: "",
  body_es: "",
  published: true,
  published_at: new Date().toISOString().slice(0, 10),
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function BlogAdmin() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<typeof empty | null>(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"en" | "es">("en");
  const [translating, setTranslating] = useState(false);

  const copyToSpanish = async () => {
    if (!editing) return;
    if (!editing.title.trim() && !editing.summary.trim() && !editing.body.trim()) {
      return toast.error("Add English content first");
    }
    setTranslating(true);
    try {
      const result = await translateBlogToSpanish({
        data: {
          title: editing.title || "",
          summary: editing.summary || "",
          body: editing.body || "",
        },
      });
      setEditing((prev) =>
        prev
          ? {
              ...prev,
              title_es: result.title,
              summary_es: result.summary,
              body_es: result.body,
            }
          : prev,
      );
      setTab("es");
      toast.success("Content copied and translated to Spanish");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Translation failed");
    } finally {
      setTranslating(false);
    }
  };

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("published_at", { ascending: false });
    if (error) toast.error(error.message);
    else setPosts((data as Post[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setTab("en");
    setEditing({ ...empty });
  };
  const startEdit = (p: Post) => {
    setTab("en");
    setEditing({
      id: p.id,
      slug: p.slug,
      title: p.title,
      title_es: p.title_es ?? "",
      summary: p.summary,
      summary_es: p.summary_es ?? "",
      author: p.author ?? "",
      cover_path: p.cover_path ?? p.cover ?? "",
      body: p.body,
      body_es: p.body_es ?? "",
      published: p.published,
      published_at: p.published_at.slice(0, 10),
    });
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) return toast.error("English title is required");
    const slug = editing.slug.trim() || slugify(editing.title);
    setSaving(true);
    const payload = {
      slug,
      title: editing.title.trim(),
      title_es: editing.title_es?.trim() || null,
      summary: editing.summary,
      summary_es: editing.summary_es || null,
      author: editing.author || null,
      cover: null,
      cover_path: editing.cover_path || null,
      body: editing.body,
      body_es: editing.body_es || null,
      published: editing.published,
      published_at: new Date(editing.published_at).toISOString(),
    };
    const { error } = editing.id
      ? await supabase.from("blog_posts").update(payload).eq("id", editing.id)
      : await supabase.from("blog_posts").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Blog</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create, edit, and publish articles in English and Spanish. Changes go live on /blog instantly.
          </p>
        </div>
        {!editing && (
          <Button onClick={startNew} size="sm">
            <Plus className="mr-1.5 h-4 w-4" /> New post
          </Button>
        )}
      </div>

      {editing ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {editing.id ? "Edit post" : "New post"}
            </h2>
            <button
              onClick={() => setEditing(null)}
              className="rounded p-1 text-slate-500 hover:bg-slate-100"
              aria-label="Close editor"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Slug (URL)">
                <Input
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  placeholder={slugify(editing.title) || "auto-generated"}
                />
              </Field>
              <Field label="Publish date">
                <Input
                  type="date"
                  value={editing.published_at}
                  onChange={(e) => setEditing({ ...editing, published_at: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Author">
              <Input
                value={editing.author}
                onChange={(e) => setEditing({ ...editing, author: e.target.value })}
              />
            </Field>
            <Field label="Cover image (drag & drop or click to upload)">
              <ImageUploader
                value={editing.cover_path || null}
                onChange={(p) => setEditing({ ...editing, cover_path: p })}
              />
            </Field>

            {/* Language tabs */}
            <div className="mt-2 flex gap-1 border-b border-slate-200">
              {(["en", "es"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setTab(l)}
                  className={`px-4 py-2 text-sm font-medium ${
                    tab === l
                      ? "border-b-2 border-primary text-primary"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {l === "en" ? "English" : "Español"}
                </button>
              ))}
            </div>

            {tab === "en" ? (
              <>
                <Field label="Title (English)">
                  <Input
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    placeholder="Welcome to the Legends blog"
                  />
                </Field>
                <Field label="Summary (English)">
                  <Textarea
                    rows={2}
                    value={editing.summary}
                    onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
                  />
                </Field>
                <Field label="Body (English)">
                  <RichTextEditor
                    value={editing.body}
                    onChange={(html) => setEditing({ ...editing, body: html })}
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label="Título (Español)">
                  <Input
                    value={editing.title_es}
                    onChange={(e) => setEditing({ ...editing, title_es: e.target.value })}
                    placeholder="(opcional — usa inglés si está vacío)"
                  />
                </Field>
                <Field label="Resumen (Español)">
                  <Textarea
                    rows={2}
                    value={editing.summary_es}
                    onChange={(e) => setEditing({ ...editing, summary_es: e.target.value })}
                  />
                </Field>
                <Field label="Cuerpo (Español)">
                  <RichTextEditor
                    value={editing.body_es}
                    onChange={(html) => setEditing({ ...editing, body_es: html })}
                  />
                </Field>
              </>
            )}

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={editing.published}
                onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
              />
              Published (visible on the public blog)
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : editing.id ? "Save changes" : "Create post"}
            </Button>
          </div>
        </div>
      ) : loading ? (
        <div className="text-sm text-slate-500">Loading posts…</div>
      ) : posts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-sm text-slate-600">No posts yet. Click "New post" to write your first article.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{p.title}</div>
                    <div className="text-xs text-slate-500">/{p.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.published
                          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                          : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                      }
                    >
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{p.view_count}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(p.published_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => startEdit(p)} className="mr-2 rounded p-1.5 text-slate-600 hover:bg-slate-100" aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove(p.id)} className="rounded p-1.5 text-rose-600 hover:bg-rose-50" aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-600">{label}</span>
      {children}
    </div>
  );
}
