import { marked } from "marked";

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  author?: string;
  cover?: string;
  content: string; // raw markdown body
  html: string; // rendered HTML body
};

// Eagerly load all markdown files at build time
const modules = import.meta.glob("/content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[m[1]] = value;
  }
  return { data, body: match[2] };
}

function slugFromPath(path: string): string {
  return path.split("/").pop()!.replace(/\.md$/, "");
}

const posts: BlogPost[] = Object.entries(modules)
  .map(([path, raw]) => {
    const { data, body } = parseFrontmatter(raw);
    const slug = slugFromPath(path);
    return {
      slug,
      title: data.title || slug,
      date: data.date || "",
      summary: data.summary || "",
      author: data.author,
      cover: data.cover,
      content: body,
      html: marked.parse(body, { async: false }) as string,
    };
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export function getAllPosts(): BlogPost[] {
  return posts;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
