"use client"

import { useEffect, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Code,
  Smile,
} from "lucide-react"
import { POPUP_CTA_BUTTONS, POPUP_TEMPLATES } from "@/lib/popup-templates"

const EMOJIS = ["🎓", "📢", "📅", "✅", "🎉", "📌", "🏫", "📝"]

type Props = {
  content: string
  onChange: (html: string) => void
  onApplyTemplate?: (html: string, popupType?: string) => void
}

export default function PopupRichTextEditor({ content, onChange, onApplyTemplate }: Props) {
  const [mounted, setMounted] = useState(false)
  const [sourceMode, setSourceMode] = useState(false)
  const [sourceHtml, setSourceHtml] = useState(content)

  useEffect(() => setMounted(true), [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: true, allowBase64: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
    setSourceHtml(content)
  }, [content, editor])

  const uploadImage = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/jpeg,image/png,image/webp,image/svg+xml"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/uploads/popups", { method: "POST", body: fd })
      const data = await res.json()
      if (res.ok && data.url) {
        editor?.chain().focus().setImage({ src: data.url }).run()
      } else {
        alert(data.error || "Upload failed")
      }
    }
    input.click()
  }

  const insertImageUrl = () => {
    const url = window.prompt("Image URL:")
    if (url) editor?.chain().focus().setImage({ src: url }).run()
  }

  const insertLink = () => {
    const url = window.prompt("Link URL:")
    if (!url) return
    const openNew = window.confirm("Open in new tab?")
    editor
      ?.chain()
      .focus()
      .setLink({ href: url, target: openNew ? "_blank" : undefined, rel: openNew ? "noopener noreferrer" : undefined })
      .run()
  }

  if (!mounted) return null

  if (sourceMode) {
    return (
      <div className="space-y-2">
        <div className="flex justify-end">
          <Button type="button" size="sm" variant="outline" onClick={() => {
            onChange(sourceHtml)
            editor?.commands.setContent(sourceHtml, { emitUpdate: false })
            setSourceMode(false)
          }}>
            Visual Editor
          </Button>
        </div>
        <Textarea
          value={sourceHtml}
          onChange={(e) => {
            setSourceHtml(e.target.value)
            onChange(e.target.value)
          }}
          rows={16}
          className="font-mono text-sm"
        />
      </div>
    )
  }

  if (!editor) return null

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="flex flex-wrap items-center gap-1 border-b bg-slate-50 p-2">
        <Select
          onValueChange={(id) => {
            const t = POPUP_TEMPLATES.find((x) => x.id === id)
            if (t) {
              editor.commands.setContent(t.content)
              onChange(t.content)
              onApplyTemplate?.(t.content, t.popupType)
            }
          }}
        >
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue placeholder="Templates" />
          </SelectTrigger>
          <SelectContent>
            {POPUP_TEMPLATES.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(html) => {
            editor.chain().focus().insertContent(html).run()
          }}
        >
          <SelectTrigger className="h-8 w-[120px] text-xs">
            <SelectValue placeholder="CTA Button" />
          </SelectTrigger>
          <SelectContent>
            {POPUP_CTA_BUTTONS.map((b) => (
              <SelectItem key={b.label} value={b.html}>
                {b.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={insertLink}>
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={uploadImage}>
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={insertImageUrl} title="Insert image URL">
          URL
        </Button>
        <Select onValueChange={(emoji) => editor.chain().focus().insertContent(emoji).run()}>
          <SelectTrigger className="h-8 w-10 px-1">
            <Smile className="h-4 w-4" />
          </SelectTrigger>
          <SelectContent>
            {EMOJIS.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            setSourceHtml(editor.getHTML())
            setSourceMode(true)
          }}
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none min-h-[280px] p-4 focus:outline-none sm:prose-base"
      />
    </div>
  )
}
