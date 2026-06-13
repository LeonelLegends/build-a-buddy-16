import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Undo,
  Redo,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { resolveBlogImage, uploadBlogImage } from "@/lib/blog-images";
import { toast } from "sonner";

const COLORS = [
  "#0f172a", "#334155", "#64748b", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
];

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[300px] focus:outline-none px-4 py-3",
      },
    },
  });

  // Keep editor in sync when switching between EN/ES tabs (external value change)
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) return toast.error("Image only");
    if (file.size > 8 * 1024 * 1024) return toast.error("Max 8 MB");
    try {
      const path = await uploadBlogImage(file);
      const url = await resolveBlogImage(path);
      if (url) editor.chain().focus().setImage({ src: url }).run();
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    }
  };

  return (
    <div className="rounded-md border border-slate-300 bg-white">
      <Toolbar editor={editor} onPickImage={() => fileRef.current?.click()} />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleImageUpload(f);
          e.target.value = "";
        }}
      />
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
}

function Toolbar({ editor, onPickImage }: { editor: Editor; onPickImage: () => void }) {
  const btn = (active: boolean) =>
    `rounded p-1.5 text-slate-700 hover:bg-slate-100 ${active ? "bg-slate-200 text-slate-900" : ""}`;

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 p-1.5">
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btn(editor.isActive("heading", { level: 1 }))} title="Heading 1"><Heading1 className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))} title="Heading 2"><Heading2 className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))} title="Heading 3"><Heading3 className="h-4 w-4" /></button>
      <Divider />
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))} title="Bold"><Bold className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))} title="Italic"><Italic className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive("underline"))} title="Underline"><UnderlineIcon className="h-4 w-4" /></button>
      <Divider />
      <ColorPicker editor={editor} />
      <Divider />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))} title="Bullet list"><List className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))} title="Numbered list"><ListOrdered className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))} title="Quote"><Quote className="h-4 w-4" /></button>
      <Divider />
      <button type="button" onClick={() => editor.chain().focus().setTextAlign("left").run()} className={btn(editor.isActive({ textAlign: "left" }))} title="Align left"><AlignLeft className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()} className={btn(editor.isActive({ textAlign: "center" }))} title="Align center"><AlignCenter className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign("right").run()} className={btn(editor.isActive({ textAlign: "right" }))} title="Align right"><AlignRight className="h-4 w-4" /></button>
      <Divider />
      <button type="button" onClick={setLink} className={btn(editor.isActive("link"))} title="Link"><LinkIcon className="h-4 w-4" /></button>
      <button type="button" onClick={onPickImage} className={btn(false)} title="Insert image"><ImageIcon className="h-4 w-4" /></button>
      <Divider />
      <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btn(false)} title="Undo"><Undo className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btn(false)} title="Redo"><Redo className="h-4 w-4" /></button>
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-slate-300" />;
}

function ColorPicker({ editor }: { editor: Editor }) {
  return (
    <div className="group relative">
      <button type="button" className="rounded p-1.5 text-slate-700 hover:bg-slate-100" title="Text color">
        <span className="block h-4 w-4 rounded-sm border border-slate-300" style={{ background: editor.getAttributes("textStyle").color || "#0f172a" }} />
      </button>
      <div className="invisible absolute left-0 top-full z-20 mt-1 rounded-md border border-slate-200 bg-white p-2 shadow-lg group-hover:visible">
        <div className="grid grid-cols-6 gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => editor.chain().focus().setColor(c).run()}
              className="h-5 w-5 rounded border border-slate-300"
              style={{ background: c }}
              aria-label={`Color ${c}`}
            />
          ))}
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetColor().run()}
            className="col-span-6 mt-1 rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
