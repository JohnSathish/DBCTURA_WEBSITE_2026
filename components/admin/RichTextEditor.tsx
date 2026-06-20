"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import { Button } from "@/components/ui/button"
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
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Paperclip,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react"
import { useEffect, useState } from "react"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  imageUploadEndpoint?: string
  fileUploadEndpoint?: string
  allowFileAttachments?: boolean
}

function getUploadedUrl(payload: any) {
  return String(payload?.url || payload?.filePath || "")
}

export default function RichTextEditor({
  content,
  onChange,
  imageUploadEndpoint = "/api/uploads/news-images",
  fileUploadEndpoint = "/api/uploads/download",
  allowFileAttachments = false,
}: RichTextEditorProps) {
  const [uploading, setUploading] = useState<null | "image" | "file">(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  const handleImageUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setUploading("image")
      try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch(imageUploadEndpoint, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Failed to upload image")
        }

        const data = await response.json()
        const url = getUploadedUrl(data)
        if (!url) throw new Error("Upload failed")
        editor?.chain().focus().setImage({ src: url }).run()
      } catch (error) {
        alert("Failed to upload image. Please try again.")
        console.error("Image upload error:", error)
      } finally {
        setUploading(null)
      }
    }
    input.click()
  }

  const handleFileUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept =
      ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/*"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setUploading("file")
      try {
        const formData = new FormData()
        formData.append("file", file)
        const response = await fetch(fileUploadEndpoint, { method: "POST", body: formData })
        const data = await response.json()
        if (!response.ok) throw new Error(data?.error || "Failed to upload file")

        const url = getUploadedUrl(data)
        if (!url) throw new Error("Upload failed")

        // If user uploads an image here, embed it; otherwise insert a link.
        if (file.type.startsWith("image/")) {
          editor?.chain().focus().setImage({ src: url }).run()
          return
        }

        const safeName = (file.name || "attachment").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        editor
          ?.chain()
          .focus()
          .insertContent(
            `<p><a href="${url}" target="_blank" rel="noreferrer noopener">${safeName}</a></p>`
          )
          .run()
      } catch (error: any) {
        alert(error?.message || "Failed to upload file. Please try again.")
        console.error("File upload error:", error)
      } finally {
        setUploading(null)
      }
    }
    input.click()
  }

  if (!editor || !mounted) {
    return null
  }

  const getCurrentHeading = () => {
    if (editor.isActive("heading", { level: 1 })) return "h1"
    if (editor.isActive("heading", { level: 2 })) return "h2"
    if (editor.isActive("heading", { level: 3 })) return "h3"
    if (editor.isActive("heading", { level: 4 })) return "h4"
    if (editor.isActive("heading", { level: 5 })) return "h5"
    if (editor.isActive("heading", { level: 6 })) return "h6"
    return "paragraph"
  }

  const handleHeadingChange = (value: string) => {
    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run()
    } else {
      const level = parseInt(value.replace("h", "")) as 1 | 2 | 3 | 4 | 5 | 6
      editor.chain().focus().toggleHeading({ level }).run()
    }
  }

  return (
    <div className="border rounded-lg">
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50 flex-wrap">
        {/* Paragraph/Heading Selector */}
        <Select value={getCurrentHeading()} onValueChange={handleHeadingChange}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paragraph">Paragraph</SelectItem>
            <SelectItem value="h1">Heading 1</SelectItem>
            <SelectItem value="h2">Heading 2</SelectItem>
            <SelectItem value="h3">Heading 3</SelectItem>
            <SelectItem value="h4">Heading 4</SelectItem>
            <SelectItem value="h5">Heading 5</SelectItem>
            <SelectItem value="h6">Heading 6</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Text Alignment */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={editor.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={editor.isActive({ textAlign: "justify" }) ? "bg-gray-200" : ""}
          title="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Text Formatting */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-gray-200" : ""}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-gray-200" : ""}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-gray-200" : ""}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-gray-200" : ""}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            const url = window.prompt("Enter URL:")
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }}
          className={editor.isActive("link") ? "bg-gray-200" : ""}
          title="Insert Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleImageUpload}
          disabled={uploading !== null}
          className={editor.isActive("image") ? "bg-gray-200" : ""}
          title="Upload Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        {allowFileAttachments ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleFileUpload}
            disabled={uploading !== null}
            title="Attach file (PDF/PPT/Word/Image)"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
      <EditorContent
        editor={editor}
        suppressHydrationWarning
        className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4"
      />
    </div>
  )
}

