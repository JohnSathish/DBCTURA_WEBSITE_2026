"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, ImageIcon, Type, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import RichTextEditor from "@/components/admin/RichTextEditor"

function stripHtmlToText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

const noticeSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    content: z.string().optional(),
    noticeType: z.enum(["document", "image", "text"]),
    pdfUrl: z.string().optional(),
    imageUrl: z.string().optional(),
    publishDate: z.string().min(1, "Publish date is required"),
    expiryDate: z.string().optional(),
    active: z.boolean().default(true),
    important: z.boolean().default(false),
    pinned: z.boolean().default(false),
  })
  .superRefine((val, ctx) => {
    if (val.noticeType === "document" && !val.pdfUrl) {
      ctx.addIssue({ code: "custom", path: ["pdfUrl"], message: "PDF is required" })
    }
    if (val.noticeType === "image" && !val.imageUrl) {
      ctx.addIssue({ code: "custom", path: ["imageUrl"], message: "Image is required" })
    }
    if (val.noticeType === "text" && (!val.content || !stripHtmlToText(val.content).length)) {
      ctx.addIssue({ code: "custom", path: ["content"], message: "Content is required" })
    }
    if (val.expiryDate) {
      const p = new Date(val.publishDate)
      const e = new Date(val.expiryDate)
      if (!isNaN(p.getTime()) && !isNaN(e.getTime()) && e <= p) {
        ctx.addIssue({
          code: "custom",
          path: ["expiryDate"],
          message: "Expiry date must be after publish date",
        })
      }
    }
  })

type NoticeFormData = z.input<typeof noticeSchema>

export interface NoticeBoardNotice {
  id: string
  title: string
  content: string | null
  noticeType: string
  pdfUrl: string | null
  imageUrl: string | null
  publishDate: Date
  expiryDate: Date | null
  active: boolean
  important: boolean
  pinned: boolean
}

export default function NoticeForm({ notice }: { notice?: NoticeBoardNotice }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [uploading, setUploading] = useState<null | "pdf" | "image">(null)

  const defaultPublish = useMemo(() => {
    const d = notice?.publishDate ? new Date(notice.publishDate) : new Date()
    return d.toISOString().split("T")[0]
  }, [notice?.publishDate])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<NoticeFormData>({
    resolver: zodResolver(noticeSchema),
    defaultValues: notice
      ? {
          title: notice.title,
          content: notice.content || "",
          noticeType: (notice.noticeType as any) || "document",
          pdfUrl: notice.pdfUrl || "",
          imageUrl: notice.imageUrl || "",
          publishDate: notice.publishDate ? new Date(notice.publishDate).toISOString().split("T")[0] : defaultPublish,
          expiryDate: notice.expiryDate ? new Date(notice.expiryDate).toISOString().split("T")[0] : "",
          active: notice.active,
          important: notice.important,
          pinned: notice.pinned,
        }
      : {
          title: "",
          content: "",
          noticeType: "document",
          pdfUrl: "",
          imageUrl: "",
          publishDate: defaultPublish,
          expiryDate: "",
          active: true,
          important: false,
          pinned: false,
        },
  })

  const noticeType = watch("noticeType")
  const active = watch("active") ?? true
  const important = watch("important") ?? false
  const pinned = watch("pinned") ?? false
  const pdfUrl = watch("pdfUrl") || ""
  const imageUrl = watch("imageUrl") || ""
  const content = watch("content") || ""

  const uploadFile = async (file: File, kind: "pdf" | "image") => {
    setUploading(kind)
    setError("")
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/uploads/download", { method: "POST", body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Upload failed")
      const url = String(json?.filePath || "")
      if (!url) throw new Error("Upload failed")
      if (kind === "pdf") setValue("pdfUrl", url, { shouldValidate: true })
      if (kind === "image") setValue("imageUrl", url, { shouldValidate: true })
    } catch (e: any) {
      setError(e?.message || "Upload failed")
    } finally {
      setUploading(null)
    }
  }

  const onSubmit = async (data: NoticeFormData) => {
    setLoading(true)
    setError("")
    try {
      const url = notice ? `/api/notice-board/notices/${notice.id}` : "/api/notice-board/notices"
      const method = notice ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          content: data.content || null,
          pdfUrl: data.pdfUrl || null,
          imageUrl: data.imageUrl || null,
          expiryDate: data.expiryDate || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Failed to save notice")
      router.push("/admin/notice-board/notices")
      router.refresh()
    } catch (e: any) {
      setError(e?.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="rounded-2xl border-slate-200">
        <CardHeader>
          <CardTitle>Notice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Notice Title *</Label>
            <Input id="title" {...register("title")} placeholder="e.g., Examination Form Submission Notice" />
            {errors.title ? <p className="text-sm text-red-600">{errors.title.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Notice Type *</Label>
            <Select value={noticeType} onValueChange={(v) => setValue("noticeType", v as any, { shouldValidate: true })}>
              <SelectTrigger className="w-full rounded-xl border-slate-200">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="document">
                  <span className="inline-flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Document (PDF)
                  </span>
                </SelectItem>
                <SelectItem value="image">
                  <span className="inline-flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> Image (JPG/PNG)
                  </span>
                </SelectItem>
                <SelectItem value="text">
                  <span className="inline-flex items-center gap-2">
                    <Type className="h-4 w-4" /> Text
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content / Upload */}
          {noticeType === "text" ? (
            <div className="space-y-2">
              <Label htmlFor="content">Description / Content *</Label>
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <RichTextEditor
                  content={content}
                  onChange={(html) => setValue("content", html, { shouldValidate: true })}
                  imageUploadEndpoint="/api/uploads/download"
                  fileUploadEndpoint="/api/uploads/download"
                  allowFileAttachments
                />
              </div>
              {errors.content ? (
                <p className="text-sm text-red-600">{String(errors.content.message)}</p>
              ) : (
                <p className="text-xs text-slate-500">
                  Tip: Use the paperclip to attach PDF/PPT/Word files, or upload images directly inside the notice.
                </p>
              )}
            </div>
          ) : null}

          {noticeType === "document" ? (
            <div className="space-y-2">
              <Label>Upload PDF *</Label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) uploadFile(file, "pdf")
                  }}
                  className="rounded-xl border-slate-200"
                />
                {pdfUrl ? (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View uploaded PDF
                  </a>
                ) : null}
              </div>
              {uploading === "pdf" ? (
                <div className="text-sm text-slate-600 inline-flex items-center gap-2">
                  <Upload className="h-4 w-4 animate-pulse" /> Uploading…
                </div>
              ) : null}
              {errors.pdfUrl ? <p className="text-sm text-red-600">{String(errors.pdfUrl.message)}</p> : null}
            </div>
          ) : null}

          {noticeType === "image" ? (
            <div className="space-y-2">
              <Label>Upload Image (JPG/PNG) *</Label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) uploadFile(file, "image")
                  }}
                  className="rounded-xl border-slate-200"
                />
                {imageUrl ? (
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View uploaded image
                  </a>
                ) : null}
              </div>
              {uploading === "image" ? (
                <div className="text-sm text-slate-600 inline-flex items-center gap-2">
                  <Upload className="h-4 w-4 animate-pulse" /> Uploading…
                </div>
              ) : null}
              {errors.imageUrl ? <p className="text-sm text-red-600">{String(errors.imageUrl.message)}</p> : null}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="publishDate">Publish Date *</Label>
              <Input id="publishDate" type="date" {...register("publishDate")} className="rounded-xl border-slate-200" />
              {errors.publishDate ? <p className="text-sm text-red-600">{errors.publishDate.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date (optional)</Label>
              <Input id="expiryDate" type="date" {...register("expiryDate")} className="rounded-xl border-slate-200" />
              {errors.expiryDate ? <p className="text-sm text-red-600">{String(errors.expiryDate.message)}</p> : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className={cn("flex items-center justify-between rounded-xl border p-3", active ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50")}>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">Active</div>
                <div className="text-xs text-slate-500">Show on student view</div>
              </div>
              <Switch checked={active} onCheckedChange={(v) => setValue("active", v)} />
            </div>

            <div className={cn("flex items-center justify-between rounded-xl border p-3", important ? "border-red-200 bg-red-50/40" : "border-slate-200 bg-white")}>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">Important</div>
                <div className="text-xs text-slate-500">Highlight (🔴)</div>
              </div>
              <Switch checked={important} onCheckedChange={(v) => setValue("important", v)} />
            </div>

            <div className={cn("flex items-center justify-between rounded-xl border p-3", pinned ? "border-blue-200 bg-blue-50/40" : "border-slate-200 bg-white")}>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">Pin</div>
                <div className="text-xs text-slate-500">Keep at top</div>
              </div>
              <Switch checked={pinned} onCheckedChange={(v) => setValue("pinned", v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading || Boolean(uploading)} className="rounded-xl">
          {loading ? "Saving..." : notice ? "Update Notice" : "Create Notice"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/notice-board/notices")}
          className="rounded-xl"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

