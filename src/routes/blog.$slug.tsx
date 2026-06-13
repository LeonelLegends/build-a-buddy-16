import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { marked } from "marked";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { resolveBlogImage } from "@/lib/blog-images";

type Post = {
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
  published_at: string;
};

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Post not found</h1>
      <Link to="/blog" className="mt-6 inline-block font-semibold text-primary">← Back to blog</Link>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-2xl font-semibold">This post didn't load</h1>
      <button onClick={reset} className="mt-6 font-semibold text-primary">Try again</button>
    </div>
  ),
});

function formatDate(iso: string, lang: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function renderBody(body: string): string {
  // Tiptap emits HTML (starts with a tag). Legacy markdown posts get marked-parsed.
  if (/^\s*</.test(body)) return body;
  return marked.parse(body || "", { async: false }) as string;
}

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { t, lang } = useI18n();
  const [post, setPost] = useState<Post | null>(null);
  const [cover, setCover] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("blog_posts")
        .select("slug,title,title_es,summary,summary_es,author,cover,cover_path,body,body_es,published_at")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      setPost((data as Post | null) ?? null);
      setLoading(false);
      if (data) {
        // best-effort view increment
        supabase.rpc("increment_blog_view", { _slug: slug });
        const url = await resolveBlogImage((data as Post).cover_path || (data as Post).cover);
        setCover(url);
      }
    })();
  }, [slug]);

  if (loading) {
    return <div className="mx-auto max-w-2xl px-6 py-24 text-center text-muted-foreground">Loading…</div>;
  }
  if (!post) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Post not found</h1>
        <Link to="/blog" className="mt-6 inline-block font-semibold text-primary">← Back to blog</Link>
      </div>
    );
  }

  const title = (lang === "es" && post.title_es?.trim()) || post.title;
  const summary = (lang === "es" && post.summary_es?.trim()) || post.summary;
  const body = (lang === "es" && post.body_es?.trim()) || post.body;
  const html = renderBody(body);

  return (
    <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <Link to="/blog" className="text-sm font-semibold text-primary hover:underline">
        ← {t("blog.back")}
      </Link>

      <header className="mt-6 mb-10">
        <time className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {formatDate(post.published_at, lang)}
        </time>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-5xl">{title}</h1>
        {summary && <p className="mt-4 text-lg text-muted-foreground">{summary}</p>}
        {post.author && (
          <p className="mt-4 text-sm text-muted-foreground">{t("blog.by")} {post.author}</p>
        )}
      </header>

      {cover && (
        <img src={cover} alt="" className="mb-10 aspect-video w-full rounded-2xl object-cover shadow-md" />
      )}

      <div
        className="blog-body prose prose-slate max-w-none prose-headings:font-display prose-headings:tracking-tight prose-a:text-primary prose-img:rounded-lg"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <style>{`
        .blog-body { white-space: pre-wrap; }
        .blog-body p:empty { min-height: 1em; margin: 0 0 1em; }
        .blog-body ol[data-list-style="upper-alpha"] { list-style-type: upper-alpha; }
        .blog-body ol[data-list-style="lower-alpha"] { list-style-type: lower-alpha; }
        .blog-body ol[data-list-style="upper-roman"] { list-style-type: upper-roman; }
        .blog-body ol[data-list-style="lower-roman"] { list-style-type: lower-roman; }
        .blog-body table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
        .blog-body table td, .blog-body table th { border: 1px dotted #94a3b8; padding: 8px 10px; vertical-align: top; }
        .blog-body table[data-borders="off"] td, .blog-body table[data-borders="off"] th { border: 1px dashed transparent; }
        .blog-body table th { background: #f1f5f9; font-weight: 600; text-align: left; }
        .blog-body ul { list-style-type: disc; padding-left: 1.6rem; }
        .blog-body ol { list-style-type: decimal; padding-left: 1.6rem; }
        .blog-body ul[data-list-style="disc"] { list-style-type: disc; }
        .blog-body ul[data-list-style="circle"] { list-style-type: circle; }
        .blog-body ul[data-list-style="square"] { list-style-type: square; }
      `}</style>
    </article>
  );
}
