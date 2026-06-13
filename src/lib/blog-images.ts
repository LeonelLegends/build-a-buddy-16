import { supabase } from "@/integrations/supabase/client";

const cache = new Map<string, { url: string; expires: number }>();

/** Resolve a stored cover image to a usable URL. Accepts full URLs or storage paths. */
export async function resolveBlogImage(value: string | null | undefined): Promise<string | null> {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;

  const now = Date.now();
  const hit = cache.get(value);
  if (hit && hit.expires > now) return hit.url;

  const { data, error } = await supabase.storage
    .from("blog-images")
    .createSignedUrl(value, 60 * 60 * 24 * 7); // 7 days
  if (error || !data) return null;
  cache.set(value, { url: data.signedUrl, expires: now + 60 * 60 * 24 * 6 * 1000 });
  return data.signedUrl;
}

export async function uploadBlogImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("blog-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return path;
}
