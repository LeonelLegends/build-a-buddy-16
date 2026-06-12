import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Pencil, X } from "lucide-react";

type Post = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  author: string | null;
  cover: string | null;
  body: string;
  published: boolean;
  published_at: string;
  updated_at: string;
};

export const Route = createFileRoute("/crm/blog")({
  component: BlogAdmin,
});

const empty = {
  id: "",
  slug: "",
  title: "",
  summary: "",
  author: "Legends Insurance Services",
  cover: "",
  body: "",
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

  const startNew = () => setEditing({ ...empty });
  const startEdit = (p: Post) =>
    setEditing({
      id: p.id,
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      author: p.author ?? "",
      cover: p.cover ?? "",
      body: p.body,
      published: p.published,
      published_at: p.published_at.slice(0, 10),
    });

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) return toast.error("Title is required");
    const slug = editing.slug.trim() || slugify(editing.title);
    setSaving(true);
    const payload = {
      slug,
      title: editing.title.trim(),
      summary: editing.summary,
      author: editing.author || null,
      cover: editing.cover || null,
      body: editing.body,
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
            Create, edit, and publish articles. Changes go live on /blog instantly.
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
            <Field label="Title">
              <Input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="Welcome to the Legends blog"
              />
            </Field>
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
                  onChange={(e) =>
                    setEditing({ ...editing, published_at: e.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="Author">
              <Input
                value={editing.author}
                onChange={(e) => setEditing({ ...editing, author: e.target.value })}
              />
            </Field>
            <Field label="Cover image URL (optional)">
              <Input
                value={editing.cover}
                onChange={(e) => setEditing({ ...editing, cover: e.target.value })}
                placeholder="https://…"
              />
            </Field>
            <Field label="Summary">
              <Textarea
                rows={2}
                value={editing.summary}
                onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
                placeholder="Short description shown on the blog index"
              />
            </Field>
            <Field label="Body (Markdown supported)">
              <Textarea
                rows={14}
                value={editing.body}
                onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                placeholder={"# Heading\n\nWrite your article here. **Bold**, _italics_, and [links](https://example.com) work."}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={editing.published}
                onChange={(e) =>
                  setEditing({ ...editing, published: e.target.checked })
                }
              />
              Published (visible on the public blog)
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
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
                    {new Date(p.published_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => startEdit(p)}
                      className="mr-2 rounded p-1.5 text-slate-600 hover:bg-slate-100"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(p.id)}
                      className="rounded p-1.5 text-rose-600 hover:bg-rose-50"
                      aria-label="Delete"
                    >
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
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-600">
        {label}
      </span>
      {children}
    </label>
  );
}
