import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, type Lang } from "@/lib/i18n";
import { resolveBlogImage } from "@/lib/blog-images";

type PostRow = {
  slug: string;
  title: string;
  title_es: string | null;
  summary: string;
  summary_es: string | null;
  cover: string | null;
  cover_path: string | null;
  body: string;
  body_es: string | null;
  published_at: string;
  view_count: number;
};

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Legends Insurance Services" },
      {
        name: "description",
        content:
          "Insights and guides on life insurance, annuities, retirement, and employee benefits from Legends Insurance Services.",
      },
      { property: "og:title", content: "Blog — Legends Insurance Services" },
      {
        property: "og:description",
        content: "Insights and guides on life insurance, annuities, retirement, and employee benefits.",
      },
    ],
  }),
  component: BlogIndex,
});

function formatDate(iso: string, lang: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function pickTitle(p: PostRow, lang: Lang) {
  return (lang === "es" && p.title_es?.trim()) || p.title;
}
function pickSummary(p: PostRow, lang: Lang) {
  return (lang === "es" && p.summary_es?.trim()) || p.summary;
}
function pickBody(p: PostRow, lang: Lang) {
  return (lang === "es" && p.body_es?.trim()) || p.body;
}

function stripHtml(s: string) {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").toLowerCase();
}

function BlogIndex() {
  const { t, lang } = useI18n();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("slug,title,title_es,summary,summary_es,cover,cover_path,body,body_es,published_at,view_count")
        .eq("published", true)
        .order("published_at", { ascending: false });
      setPosts((data as PostRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => {
      const hay = [
        pickTitle(p, lang),
        pickSummary(p, lang),
        stripHtml(pickBody(p, lang) || ""),
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [posts, query, lang]);

  const popular = useMemo(
    () => [...posts].sort((a, b) => b.view_count - a.view_count).slice(0, 10),
    [posts],
  );

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <header className="mb-12 text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">{t("blog.title")}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">{t("blog.subtitle")}</p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
        <div>
          {loading ? (
            <p className="text-center text-muted-foreground">{lang === "es" ? "Cargando…" : "Loading…"}</p>
          ) : filtered.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
              {query
                ? lang === "es"
                  ? `No se encontraron artículos con "${query}".`
                  : `No articles found matching "${query}".`
                : t("blog.empty")}
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {filtered.map((post) => (
                <PostCard key={post.slug} post={post} lang={lang} t={t} />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {lang === "es" ? "Buscar" : "Search"}
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={lang === "es" ? "Escribe para buscar…" : "Type to search…"}
                className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {lang === "es" ? "Más leídos" : "Most viewed"}
            </h3>
            {popular.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("blog.empty")}</p>
            ) : (
              <ol className="space-y-3">
                {popular.map((p, i) => (
                  <li key={p.slug} className="flex gap-3 text-sm">
                    <span className="font-display text-lg font-bold text-primary/60">{i + 1}</span>
                    <Link
                      to="/blog/$slug"
                      params={{ slug: p.slug }}
                      target="_blank"
                      rel="noopener"
                      className="line-clamp-2 font-medium text-foreground hover:text-primary"
                    >
                      {pickTitle(p, lang)}
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function PostCard({ post, lang, t }: { post: PostRow; lang: Lang; t: (k: string) => string }) {
  const [cover, setCover] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    resolveBlogImage(post.cover_path || post.cover).then((u) => {
      if (!cancel) setCover(u);
    });
    return () => {
      cancel = true;
    };
  }, [post.cover_path, post.cover]);

  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      target="_blank"
      rel="noopener"
      className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
    >
      {cover && (
        <img src={cover} alt="" className="mb-4 aspect-video w-full rounded-lg object-cover" />
      )}
      <time className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {formatDate(post.published_at, lang)}
      </time>
      <h2 className="mt-2 font-display text-xl font-semibold leading-snug text-foreground group-hover:text-primary">
        {pickTitle(post, lang)}
      </h2>
      <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted-foreground">
        {pickSummary(post, lang)}
      </p>
      <span className="mt-4 text-sm font-semibold text-primary">{t("blog.read")} →</span>
    </Link>
  );
}