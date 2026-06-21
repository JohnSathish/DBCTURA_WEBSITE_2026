"use client"

import { useCallback, useState } from "react"
import { cn } from "@/lib/utils"
import { Upload, FileText } from "lucide-react"

type PdfDropzoneProps = {
  file: File | null
  onFile: (file: File | null) => void
  disabled?: boolean
  id?: string
}

export default function PdfDropzone({ file, onFile, disabled, id = "syllabus-pdf" }: PdfDropzoneProps) {
  const [dragOver, setDragOver] = useState(false)

  const acceptPdf = useCallback(
    (candidate: File | null) => {
      if (!candidate) return
      if (candidate.type !== "application/pdf" && !candidate.name.toLowerCase().endsWith(".pdf")) {
        alert("Only PDF files are allowed")
        return
      }
      onFile(candidate)
    },
    [onFile]
  )

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 border-dashed p-6 text-center transition-colors",
        dragOver ? "border-indigo-400 bg-indigo-50/50" : "border-slate-200 bg-slate-50/50",
        disabled && "pointer-events-none opacity-60"
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        acceptPdf(e.dataTransfer.files?.[0] ?? null)
      }}
    >
      <input
        id={id}
        type="file"
        accept=".pdf,application/pdf"
        className="sr-only"
        disabled={disabled}
        onChange={(e) => acceptPdf(e.target.files?.[0] ?? null)}
      />
      <label htmlFor={id} className="flex cursor-pointer flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
          {file ? <FileText className="h-6 w-6 text-red-600" /> : <Upload className="h-6 w-6 text-indigo-600" />}
        </div>
        {file ? (
          <>
            <p className="text-sm font-medium text-slate-900">{file.name}</p>
            <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB — click to replace</p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-slate-900">Drag & drop syllabus PDF here</p>
            <p className="text-xs text-slate-500">or click to browse — PDF only</p>
          </>
        )}
      </label>
    </div>
  )
}
