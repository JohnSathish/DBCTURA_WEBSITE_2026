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
import { Switch } from "@/components/ui/switch"
import { Upload, File, X, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

const flashNewsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  file: z.string().optional(),
  fileType: z.string().optional(),
  displayOrder: z.number().min(0).default(0),
  published: z.boolean().default(true),
})

type FlashNewsFormData = z.input<typeof flashNewsSchema>

interface FlashNews {
  id: string
  title: string
  description: string | null
  file: string | null
  fileType: string | null
  displayOrder: number
  published: boolean
}

interface FlashNewsFormProps {
  flashNews?: FlashNews
}

export default function FlashNewsForm({ flashNews }: FlashNewsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [uploadedFile, setUploadedFile] = useState<{ url: string; type: string } | null>(
    flashNews?.file ? { url: flashNews.file, type: flashNews.fileType || "image" } : null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FlashNewsFormData>({
    resolver: zodResolver(flashNewsSchema),
    defaultValues: flashNews
      ? {
          title: flashNews.title,
          description: flashNews.description || "",
          file: flashNews.file || "",
          fileType: flashNews.fileType || "",
          displayOrder: flashNews.displayOrder,
          published: flashNews.published,
        }
      : {
          title: "",
          description: "",
          file: "",
          fileType: "",
          displayOrder: 0,
          published: true,
        },
  })

  const published = watch("published") ?? true

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/uploads/flash-news", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload file")
      }

      const result = await response.json()
      setValue("file", result.filePath)
      setValue("fileType", result.fileType)
      setUploadedFile({ url: result.filePath, type: result.fileType })
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
    setValue("fileType", "")
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const onSubmit = async (data: FlashNewsFormData) => {
    setLoading(true)
    setError("")

    try {
      const url = flashNews ? `/api/flash-news/${flashNews.id}` : "/api/flash-news"
      const method = flashNews ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          displayOrder: typeof data.displayOrder === "number" ? data.displayOrder : 0,
          published: typeof data.published === "boolean" ? data.published : true,
          description: data.description || null,
          file: data.file || null,
          fileType: data.file || null ? data.fileType : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save flash news")
      }

      router.push("/admin/flash-news")
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
          <CardTitle>Flash News Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="e.g., Library Hours Update"
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
              placeholder="Detailed description (visible when viewing the full news item)"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File Upload (Optional)</Label>
            {uploadedFile ? (
              <div className="border rounded-lg p-4 bg-gray-50">
                {uploadedFile.type === "image" ? (
                  <div className="relative w-full max-w-md mb-3 rounded-lg overflow-hidden bg-gray-200">
                    <Image
                      src={uploadedFile.url}
                      alt="Uploaded file"
                      width={400}
                      height={300}
                      className="object-cover w-full"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                    <File className="h-8 w-8 text-red-500" />
                    <div className="flex-1">
                      <p className="font-medium">PDF File</p>
                      <p className="text-sm text-gray-600">{uploadedFile.url}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{uploadedFile.url}</p>
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
                  accept="image/*,application/pdf"
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
                    JPG, PNG, GIF, WebP, PDF (Max 10MB)
                  </span>
                </label>
              </div>
            )}
            <input type="hidden" {...register("file")} />
            <input type="hidden" {...register("fileType")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input
              id="displayOrder"
              type="number"
              {...register("displayOrder", { valueAsNumber: true })}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={published}
              onCheckedChange={(checked) => setValue("published", checked)}
            />
            <Label htmlFor="published" className="cursor-pointer">
              Published
            </Label>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading || uploading}>
          {loading ? "Saving..." : uploading ? "Uploading..." : flashNews ? "Update Flash News" : "Create Flash News"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/flash-news")}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

