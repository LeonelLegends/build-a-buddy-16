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

const MAX_WIDTH = 1600;
const QUALITY = 0.82;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

/** Resize to max 1600px wide and re-encode as WebP (JPEG fallback) without visible quality loss. */
export async function compressImage(file: File): Promise<{ blob: Blob; ext: string; type: string }> {
  // GIFs may be animated and SVGs are vector — leave them untouched.
  if (file.type === "image/gif" || file.type === "image/svg+xml") {
    return { blob: file, ext: file.name.split(".").pop()?.toLowerCase() || "bin", type: file.type };
  }

  try {
    const img = await loadImage(file);
    const scale = Math.min(1, MAX_WIDTH / img.naturalWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas context");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const encode = (type: string) =>
      new Promise<Blob | null>((res) => canvas.toBlob(res, type, QUALITY));

    let blob = await encode("image/webp");
    let type = "image/webp";
    let ext = "webp";
    if (!blob || blob.type !== "image/webp") {
      blob = await encode("image/jpeg");
      type = "image/jpeg";
      ext = "jpg";
    }
    if (!blob) throw new Error("encode failed");
    // Keep the original when compression does not help.
    if (blob.size >= file.size) {
      return { blob: file, ext: file.name.split(".").pop()?.toLowerCase() || "bin", type: file.type };
    }
    return { blob, ext, type };
  } catch {
    return { blob: file, ext: file.name.split(".").pop()?.toLowerCase() || "bin", type: file.type };
  }
}

export async function uploadBlogImage(file: File): Promise<string> {
  const { blob, ext, type } = await compressImage(file);
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("blog-images")
    .upload(path, blob, { contentType: type, upsert: false });
  if (error) throw error;
  return path;
}
