"use client"

import { cn } from "@/lib/utils"
import { ImagePlus, Upload, X } from "lucide-react"
import Image from "next/image"
import { useCallback, useRef, useState } from "react"
import { FYUG_LABEL_GAP } from "./fyug-theme"

type Props = {
  value: File | null
  previewUrl?: string | null
  onChange: (file: File | null) => void
  error?: string
}

export default function FyugPhotoUpload({ value, previewUrl, onChange, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | null>(null)

  const displayUrl = localPreview ?? previewUrl

  const handleFile = useCallback(
    (file: File | null) => {
      if (localPreview) URL.revokeObjectURL(localPreview)
      if (!file) {
        setLocalPreview(null)
        onChange(null)
        return
      }
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) return
      if (file.size > 2 * 1024 * 1024) return
      setLocalPreview(URL.createObjectURL(file))
      onChange(file)
    },
    [localPreview, onChange]
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className={FYUG_LABEL_GAP}>
      <span className="block text-sm font-medium text-slate-700">
        Applicant Photograph <span className="text-[#EF4444]">*</span>
      </span>

      {displayUrl ? (
        <div className="relative overflow-hidden rounded-lg border border-[#DCE3EC] bg-slate-50">
          <div className="relative mx-auto aspect-[3/4] max-h-36 w-full max-w-[130px]">
            <Image src={displayUrl} alt="Applicant preview" fill className="object-cover" unoptimized />
          </div>
          <button
            type="button"
            onClick={() => {
              handleFile(null)
              if (inputRef.current) inputRef.current.value = ""
            }}
            className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 shadow-md transition hover:bg-white"
            aria-label="Remove photo"
          >
            <X className="h-4 w-4 text-slate-600" />
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-3 py-5 text-center transition-all",
            dragOver
              ? "border-[#2563EB] bg-blue-50/50"
              : "border-[#DCE3EC] bg-slate-50/50 hover:border-[#2563EB]/50 hover:bg-blue-50/30",
            error && "border-[#EF4444]"
          )}
        >
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-[#2563EB]">
            {dragOver ? <Upload className="h-4 w-4" /> : <ImagePlus className="h-4 w-4" />}
          </div>
          <p className="text-xs font-medium text-slate-700">Click to Upload</p>
          <p className="mt-0.5 text-[11px] text-slate-500">or Drag Image Here</p>
          <p className="mt-1 text-[10px] text-slate-400">PNG, JPG · Max 2MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
      {error && (
        <p className="text-[13px] text-[#EF4444]" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
