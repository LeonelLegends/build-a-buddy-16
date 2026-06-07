import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPostBySlug } from "@/lib/blog";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPostBySlug(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.post.title} — Legends Insurance Services` },
          { name: "description", content: loaderData.post.summary },
          { property: "og:title", content: loaderData.post.title },
          { property: "og:description", content: loaderData.post.summary },
          ...(loaderData.post.cover
            ? [{ property: "og:image", content: loaderData.post.cover }]
            : []),
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Post not found</h1>
      <Link to="/blog" className="mt-6 inline-block font-semibold text-primary">
        ← Back to blog
      </Link>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-2xl font-semibold">This post didn't load</h1>
      <button onClick={reset} className="mt-6 font-semibold text-primary">
        Try again
      </button>
    </div>
  ),
  component: BlogPostPage,
});

function formatDate(iso: string, lang: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  const { t, lang } = useI18n();

  return (
    <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <Link
        to="/blog"
        className="text-sm font-semibold text-primary hover:underline"
      >
        ← {t("blog.back")}
      </Link>

      <header className="mt-6 mb-10">
        <time className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {formatDate(post.date, lang)}
        </time>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-5xl">
          {post.title}
        </h1>
        {post.summary && (
          <p className="mt-4 text-lg text-muted-foreground">{post.summary}</p>
        )}
        {post.author && (
          <p className="mt-4 text-sm text-muted-foreground">
            {t("blog.by")} {post.author}
          </p>
        )}
      </header>

      {post.cover && (
        <img
          src={post.cover}
          alt=""
          className="mb-10 aspect-video w-full rounded-2xl object-cover shadow-md"
        />
      )}

      <div
        className="prose prose-slate max-w-none prose-headings:font-display prose-headings:tracking-tight prose-a:text-primary"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
    </article>
  );
}
