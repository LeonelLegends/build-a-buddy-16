import { useCallback, useEffect, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { resolveBlogImage, uploadBlogImage } from "@/lib/blog-images";

type Props = {
  value: string | null;
  onChange: (path: string | null) => void;
};

export function ImageUploader({ value, onChange }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    let cancel = false;
    resolveBlogImage(value).then((u) => {
      if (!cancel) setPreview(u);
    });
    return () => {
      cancel = true;
    };
  }, [value]);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        toast.error("Image must be under 8 MB");
        return;
      }
      setBusy(true);
      try {
        const path = await uploadBlogImage(file);
        onChange(path);
        toast.success("Image uploaded");
      } catch (e: any) {
        toast.error(e?.message ?? "Upload failed");
      } finally {
        setBusy(false);
      }
    },
    [onChange],
  );

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`relative flex min-h-[160px] items-center justify-center rounded-lg border-2 border-dashed bg-slate-50 p-4 transition ${
          dragOver ? "border-primary bg-primary/5" : "border-slate-300"
        }`}
      >
        {preview ? (
          <div className="relative w-full">
            <img src={preview} alt="" className="mx-auto max-h-48 rounded object-contain" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute right-1 top-1 rounded-full bg-white p-1 shadow hover:bg-slate-100"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center gap-2 text-center text-sm text-slate-600">
            {busy ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            ) : (
              <Upload className="h-6 w-6 text-slate-400" />
            )}
            <span>Drag & drop, or <span className="font-semibold text-primary">click to choose</span></span>
            <span className="text-xs text-slate-400">PNG, JPG, GIF, WebP — up to 8 MB</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
              disabled={busy}
            />
          </label>
        )}
      </div>
    </div>
  );
}
