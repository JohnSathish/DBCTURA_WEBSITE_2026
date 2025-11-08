"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, File, X } from "lucide-react"

const downloadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  file: z.string().min(1, "File is required"),
  category: z.string().optional(),
})

type DownloadFormData = z.infer<typeof downloadSchema>

interface Download {
  id: string
  title: string
  description: string | null
  file: string
  category: string | null
  uploadedAt: Date
}

export default function DownloadForm({ download }: { download?: Download }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [uploadedFile, setUploadedFile] = useState<{ name: string; path: string } | null>(
    download ? { name: download.file.split("/").pop() || "File", path: download.file } : null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DownloadFormData>({
    resolver: zodResolver(downloadSchema),
    defaultValues: download
      ? {
          title: download.title,
          description: download.description || "",
          file: download.file,
          category: download.category || "",
        }
      : {
          title: "",
          description: "",
          file: "",
          category: "",
        },
  })

  const filePath = watch("file")

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/uploads/download", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload file")
      }

      const result = await response.json()
      setValue("file", result.filePath)
      setUploadedFile({ name: result.fileName, path: result.filePath })
    } catch (err: any) {
      setError(err.message || "Failed to upload file")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setValue("file", "")
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const onSubmit = async (data: DownloadFormData) => {
    setLoading(true)
    setError("")

    try {
      const url = download ? `/api/downloads/${download.id}` : "/api/downloads"
      const method = download ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save download")
      }

      router.push("/admin/downloads")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Download Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Download title"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Brief description of the file"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File *</Label>
            {uploadedFile ? (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <File className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-500">{uploadedFile.path}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                />
                <label
                  htmlFor="file"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">
                    {uploading ? "Uploading..." : "Click to upload file"}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP, RAR (Max 10MB)
                  </span>
                </label>
              </div>
            )}
            {errors.file && (
              <p className="text-sm text-red-600">{errors.file.message}</p>
            )}
            <input type="hidden" {...register("file")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              {...register("category")}
              placeholder="Forms, Documents, Brochures, etc."
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading || uploading || !filePath}>
          {loading ? "Saving..." : uploading ? "Uploading..." : download ? "Update Download" : "Create Download"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/downloads")}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

