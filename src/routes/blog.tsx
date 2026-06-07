import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { getAllPosts } from "@/lib/blog";
import { useI18n } from "@/lib/i18n";

// GitHub repo configuration for dynamically listing markdown posts
const repo = "LeonelLegends/legendsinsurance";
const folder = "content/blog";

type GitHubFile = { name: string; download_url: string };

async function loadBlogs() {
  const container = document.getElementById("blog-container");
  if (!container) return;
  container.innerHTML = "";

  const url = `https://api.github.com/repos/${repo}/contents/${folder}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`GitHub responded ${response.status}`);
    const files: GitHubFile[] = await response.json();

    const markdownFiles = files.filter((file) => file.name.endsWith(".md"));

    for (const file of markdownFiles) {
      const postResponse = await fetch(file.download_url);
      const content = await postResponse.text();

      // Title = first "# Heading" line, falling back to filename
      const headingLine = content.split("\n").find((l) => l.startsWith("# "));
      const title = headingLine
        ? headingLine.replace(/^#\s+/, "")
        : file.name.replace(/\.md$/, "");

      const slug = file.name.replace(/\.md$/, "");

      const card = document.createElement("div");
      card.className =
        "blog-card group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg";
      card.innerHTML = `
        <h3 class="font-display text-xl font-semibold leading-snug text-foreground group-hover:text-primary">${title}</h3>
        <a href="/blog/${slug}" class="mt-4 text-sm font-semibold text-primary">Read more →</a>
      `;
      container.appendChild(card);
    }
  } catch (error) {
    console.error("Error loading blogs:", error);
  }
}

export const Route = createFileRoute("/blog")({
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
        content:
          "Insights and guides on life insurance, annuities, retirement, and employee benefits.",
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
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function BlogIndex() {
  const { t, lang } = useI18n();
  const posts = getAllPosts();

  useEffect(() => {
    loadBlogs();
  }, []);



  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <header className="mb-12 text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          {t("blog.title")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
          {t("blog.subtitle")}
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-center text-muted-foreground">{t("blog.empty")}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              {post.cover && (
                <img
                  src={post.cover}
                  alt=""
                  className="mb-4 aspect-video w-full rounded-lg object-cover"
                />
              )}
              <time className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {formatDate(post.date, lang)}
              </time>
              <h2 className="mt-2 font-display text-xl font-semibold leading-snug text-foreground group-hover:text-primary">
                {post.title}
              </h2>
              <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted-foreground">
                {post.summary}
              </p>
              <span className="mt-4 text-sm font-semibold text-primary">
                {t("blog.read")} →
              </span>
            </Link>
          ))}
        </div>
      )}

      <div
        id="blog-container"
        className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      />
    </section>
  );
}
