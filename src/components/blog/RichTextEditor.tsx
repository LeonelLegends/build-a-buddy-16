import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
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
  Table as TableIcon,
  Rows,
  Columns,
  Trash2,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { resolveBlogImage, uploadBlogImage } from "@/lib/blog-images";
import { toast } from "sonner";

const COLORS = [
  "#0f172a", "#334155", "#64748b", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
];

const FONTS = [
  { label: "Default", value: "" },
  { label: "Sans", value: "ui-sans-serif, system-ui, sans-serif" },
  { label: "Serif", value: "ui-serif, Georgia, serif" },
  { label: "Mono", value: "ui-monospace, SFMono-Regular, Menlo, monospace" },
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times", value: '"Times New Roman", Times, serif' },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Courier", value: '"Courier New", Courier, monospace' },
];

const LIST_STYLES: { label: string; value: string }[] = [
  { label: "1, 2, 3", value: "decimal" },
  { label: "A, B, C", value: "upper-alpha" },
  { label: "a, b, c", value: "lower-alpha" },
  { label: "I, II, III", value: "upper-roman" },
  { label: "i, ii, iii", value: "lower-roman" },
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
      TextStyle,
      Color,
      FontFamily.configure({ types: ["textStyle"] }),
      Image.configure({ inline: false, allowBase64: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true, HTMLAttributes: { class: "rte-table" } }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "rte-content prose prose-slate max-w-none focus:outline-none px-4 py-3",
      },
      handleKeyDown: (_view, event) => {
        if (event.key === "Tab") {
          event.preventDefault();
          // Insert real tab character (preserved by white-space: pre-wrap)
          editor?.chain().focus().insertContent("\t").run();
          return true;
        }
        return false;
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
      <div className="sticky top-0 z-10 rounded-t-md border-b border-slate-200 bg-slate-50">
        <Toolbar editor={editor} onPickImage={() => fileRef.current?.click()} />
      </div>
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
      <div
        className="overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 320px)", minHeight: "300px" }}
      >
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
      <style>{`
        .rte-content { white-space: pre-wrap; }
        .rte-content p:empty::before { content: ""; display: inline-block; }
        .rte-content ol[data-list-style="upper-alpha"] { list-style-type: upper-alpha; }
        .rte-content ol[data-list-style="lower-alpha"] { list-style-type: lower-alpha; }
        .rte-content ol[data-list-style="upper-roman"] { list-style-type: upper-roman; }
        .rte-content ol[data-list-style="lower-roman"] { list-style-type: lower-roman; }
        .rte-content ol[data-list-style="decimal"] { list-style-type: decimal; }
        .rte-content table.rte-table { border-collapse: collapse; width: 100%; margin: 0.75rem 0; table-layout: fixed; }
        .rte-content table.rte-table td, .rte-content table.rte-table th { border: 1px solid #cbd5e1; padding: 6px 8px; vertical-align: top; min-width: 60px; }
        .rte-content table.rte-table th { background: #f1f5f9; font-weight: 600; text-align: left; }
        .rte-content .selectedCell { background: rgba(59,130,246,0.15); }
      `}</style>
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

  const currentFont = (editor.getAttributes("textStyle").fontFamily as string) || "";

  const applyListStyle = (style: string) => {
    if (!editor.isActive("orderedList")) {
      editor.chain().focus().toggleOrderedList().run();
    }
    // Tag the closest ol node by updating attributes via DOM after the fact
    requestAnimationFrame(() => {
      const dom = (editor.view.dom as HTMLElement);
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      let node: HTMLElement | null = sel.anchorNode as HTMLElement | null;
      while (node && node !== dom && node.nodeName !== "OL") {
        node = node.parentElement;
      }
      if (node && node.nodeName === "OL") {
        node.setAttribute("data-list-style", style);
        // trigger onUpdate
        editor.commands.focus();
        onChangeFire(editor);
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-1.5">
      <select
        value={currentFont}
        onChange={(e) => {
          const v = e.target.value;
          if (v) editor.chain().focus().setFontFamily(v).run();
          else editor.chain().focus().unsetFontFamily().run();
        }}
        className="mr-1 rounded border border-slate-200 bg-white px-1.5 py-1 text-xs text-slate-700"
        title="Font family"
      >
        {FONTS.map((f) => (
          <option key={f.label} value={f.value}>{f.label}</option>
        ))}
      </select>
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
      <select
        onChange={(e) => {
          const v = e.target.value;
          if (v) applyListStyle(v);
          e.target.value = "";
        }}
        defaultValue=""
        className="rounded border border-slate-200 bg-white px-1 py-1 text-xs text-slate-700"
        title="List style"
      >
        <option value="" disabled>List style</option>
        {LIST_STYLES.map((l) => (
          <option key={l.value} value={l.value}>{l.label}</option>
        ))}
      </select>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))} title="Quote"><Quote className="h-4 w-4" /></button>
      <Divider />
      <button type="button" onClick={() => editor.chain().focus().setTextAlign("left").run()} className={btn(editor.isActive({ textAlign: "left" }))} title="Align left"><AlignLeft className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()} className={btn(editor.isActive({ textAlign: "center" }))} title="Align center"><AlignCenter className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign("right").run()} className={btn(editor.isActive({ textAlign: "right" }))} title="Align right"><AlignRight className="h-4 w-4" /></button>
      <Divider />
      <button type="button" onClick={setLink} className={btn(editor.isActive("link"))} title="Link"><LinkIcon className="h-4 w-4" /></button>
      <button type="button" onClick={onPickImage} className={btn(false)} title="Insert image"><ImageIcon className="h-4 w-4" /></button>
      <Divider />
      <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className={btn(false)} title="Insert table"><TableIcon className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className={btn(false)} title="Add row"><Rows className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className={btn(false)} title="Add column"><Columns className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className={btn(false)} title="Delete table"><Trash2 className="h-4 w-4" /></button>
      <Divider />
      <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btn(false)} title="Undo"><Undo className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btn(false)} title="Redo"><Redo className="h-4 w-4" /></button>
    </div>
  );
}

function onChangeFire(editor: Editor) {
  // Force an update event so parent receives new HTML with data-list-style attr
  editor.emit("update", { editor, transaction: editor.state.tr, appendedTransactions: [] });
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
