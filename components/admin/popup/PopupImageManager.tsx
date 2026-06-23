"use client"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Trash2, Upload } from "lucide-react"
import Image from "next/image"

type UploadedImage = { id?: string; imageUrl: string }

type Props = {
  popupId?: string
  images: UploadedImage[]
  onUploaded: (url: string) => void
  onInsert: (url: string) => void
}

export default function PopupImageManager({ popupId, images, onUploaded, onInsert }: Props) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true)
      try {
        const fd = new FormData()
        fd.append("file", file)
        if (popupId) fd.append("popupId", popupId)
        const res = await fetch("/api/uploads/popups", { method: "POST", body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Upload failed")
        onUploaded(data.url)
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Upload failed")
      } finally {
        setUploading(false)
      }
    },
    [onUploaded, popupId]
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          dragOver ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-slate-50"
        }`}
      >
        <Upload className="mx-auto mb-2 h-8 w-8 text-slate-400" />
        <p className="text-sm text-slate-600">Drag & drop JPG, PNG, WEBP, or SVG (max 5 MB)</p>
        <label className="mt-3 inline-block">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) uploadFile(file)
            }}
          />
          <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
            <span>{uploading ? "Uploading…" : "Browse File"}</span>
          </Button>
        </label>
      </div>

      {images.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {images.map((img) => (
            <div key={img.imageUrl} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="relative aspect-video bg-slate-100">
                <Image src={img.imageUrl} alt="" fill className="object-contain p-2" unoptimized />
              </div>
              <div className="space-y-2 p-3">
                <Input readOnly value={img.imageUrl} className="h-8 text-xs" />
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" className="flex-1" onClick={() => onInsert(img.imageUrl)}>
                    Insert
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(img.imageUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
