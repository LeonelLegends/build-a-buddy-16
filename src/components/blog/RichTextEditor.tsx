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
  Merge,
  Split,
  Square,
  SquareDashed,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { resolveBlogImage, uploadBlogImage } from "@/lib/blog-images";
import { toast } from "sonner";

const COLORS = [
  "#000000", "#374151", "#6b7280", "#9ca3af", "#d1d5db", "#ffffff",
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e",
  "#10b981", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6",
  "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#78350f", "#14532d",
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
    autofocus: "end",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "rte-content prose prose-slate max-w-none focus:outline-none px-4 py-3",
      },
      handleKeyDown: (_view, event) => {
        if (event.key === "Tab") {
          event.preventDefault();
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
        onClick={() => {
          if (!editor.isFocused) editor.commands.focus();
        }}
      >
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
      <style>{`
        .rte-content { white-space: pre-wrap; }
        .rte-content p:empty::before { content: ""; display: inline-block; }
        .rte-content ul { list-style-type: disc; padding-left: 1.6rem; margin: 0.5rem 0; }
        .rte-content ol { list-style-type: decimal; padding-left: 1.6rem; margin: 0.5rem 0; }
        .rte-content ul li, .rte-content ol li { display: list-item; margin: 0.15rem 0; }
        .rte-content ol[data-list-style="upper-alpha"] { list-style-type: upper-alpha; }
        .rte-content ol[data-list-style="lower-alpha"] { list-style-type: lower-alpha; }
        .rte-content ol[data-list-style="upper-roman"] { list-style-type: upper-roman; }
        .rte-content ol[data-list-style="lower-roman"] { list-style-type: lower-roman; }
        .rte-content ol[data-list-style="decimal"] { list-style-type: decimal; }

        .rte-content table.rte-table { border-collapse: collapse; width: 100%; margin: 0.75rem 0; table-layout: fixed; overflow: hidden; }
        .rte-content table.rte-table td,
        .rte-content table.rte-table th {
          border: 1px dotted #94a3b8;
          padding: 6px 8px;
          vertical-align: top;
          min-width: 60px;
          position: relative;
        }
        .rte-content table.rte-table[data-borders="off"] td,
        .rte-content table.rte-table[data-borders="off"] th {
          border: 1px dashed transparent;
        }
        .rte-content table.rte-table th { background: #f1f5f9; font-weight: 600; text-align: left; }
        .rte-content .selectedCell { background: rgba(59,130,246,0.15); }

        /* Tiptap column resize handle */
        .rte-content .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: -2px;
          width: 4px;
          background-color: #3b82f6;
          pointer-events: none;
        }
        .rte-content.resize-cursor { cursor: col-resize; }
        .rte-content .tableWrapper { overflow-x: auto; }
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
    requestAnimationFrame(() => {
      const dom = editor.view.dom as HTMLElement;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      let node: HTMLElement | null = sel.anchorNode as HTMLElement | null;
      while (node && node !== dom && node.nodeName !== "OL") {
        node = node.parentElement;
      }
      if (node && node.nodeName === "OL") {
        node.setAttribute("data-list-style", style);
        editor.commands.focus();
        onChangeFire(editor);
      }
    });
  };

  const toggleTableBorders = () => {
    const dom = editor.view.dom as HTMLElement;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    let node: HTMLElement | null = sel.anchorNode as HTMLElement | null;
    while (node && node !== dom && node.nodeName !== "TABLE") {
      node = node.parentElement;
    }
    if (node && node.nodeName === "TABLE") {
      const current = node.getAttribute("data-borders");
      node.setAttribute("data-borders", current === "off" ? "on" : "off");
      editor.commands.focus();
      onChangeFire(editor);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-1.5">
      <select
        value={currentFont}
        onChange={(e) => {
          const v = e.target.value;
          if (v) editor.chain().focus().setFontFamily(v).run();
          else editor.chain().focus().unsetFontFamily().run();
          // Return focus to editor, not the select
          requestAnimationFrame(() => editor.commands.focus());
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="mr-1 rounded border border-slate-200 bg-white px-1.5 py-1 text-xs text-slate-700"
        title="Font family"
        tabIndex={-1}
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
      <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }} className={btn(editor.isActive("bulletList"))} title="Bullet list"><List className="h-4 w-4" /></button>
      <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }} className={btn(editor.isActive("orderedList"))} title="Numbered list"><ListOrdered className="h-4 w-4" /></button>
      <select
        onChange={(e) => {
          const v = e.target.value;
          if (v) applyListStyle(v);
          e.target.value = "";
          requestAnimationFrame(() => editor.commands.focus());
        }}
        defaultValue=""
        className="rounded border border-slate-200 bg-white px-1 py-1 text-xs text-slate-700"
        title="List style"
        tabIndex={-1}
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
      <button type="button" onClick={() => editor.chain().focus().mergeCells().run()} className={btn(false)} title="Merge cells"><Merge className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().splitCell().run()} className={btn(false)} title="Split cell"><Split className="h-4 w-4" /></button>
      <button type="button" onClick={toggleTableBorders} className={btn(false)} title="Toggle table borders"><SquareDashed className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className={btn(false)} title="Delete table"><Trash2 className="h-4 w-4" /></button>
      <Divider />
      <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btn(false)} title="Undo"><Undo className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btn(false)} title="Redo"><Redo className="h-4 w-4" /></button>
    </div>
  );
}

function onChangeFire(editor: Editor) {
  editor.emit("update", { editor, transaction: editor.state.tr, appendedTransactions: [] });
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-slate-300" />;
}

function ColorPicker({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const current = (editor.getAttributes("textStyle").color as string) || "#0f172a";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded p-1.5 text-slate-700 hover:bg-slate-100"
        title="Text color"
      >
        <span className="block h-4 w-4 rounded-sm border border-slate-300" style={{ background: current }} />
        <span className="text-[10px] text-slate-500">▾</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-64 rounded-md border border-slate-200 bg-white p-3 shadow-xl">
          <div className="mb-2 text-xs font-medium text-slate-600">Text color</div>
          <div className="grid grid-cols-6 gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  editor.chain().focus().setColor(c).run();
                  setOpen(false);
                }}
                className="h-8 w-8 rounded border border-slate-300 transition hover:scale-110 hover:shadow"
                style={{ background: c }}
                aria-label={`Color ${c}`}
                title={c}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <label className="flex items-center gap-1 text-xs text-slate-600">
              Custom:
              <input
                type="color"
                value={current}
                onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                className="h-7 w-10 cursor-pointer rounded border border-slate-300"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().unsetColor().run();
                setOpen(false);
              }}
              className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
