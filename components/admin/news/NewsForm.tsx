"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import RichTextEditor from "@/components/admin/RichTextEditor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

const newsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string(),
  excerpt: z.string().optional(),
  image: z.string().optional(),
  featured: z.boolean(),
  publishedAt: z.string().optional(),
})

type NewsFormData = z.infer<typeof newsSchema>

interface News {
  id: string
  title: string
  content: string
  excerpt: string | null
  image: string | null
  category?: string | null
  featured: boolean
  publishedAt: Date | null
}

export default function NewsForm({ news }: { news?: News }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>(news?.image || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: news
      ? {
          title: news.title,
          content: news.content,
          excerpt: news.excerpt || "",
          image: news.image || "",
          featured: news.featured,
          publishedAt: news.publishedAt ? news.publishedAt.toISOString().split("T")[0] : "",
        }
      : {
          title: "",
          content: "",
          excerpt: "",
          image: "",
          featured: false,
          publishedAt: "",
        },
  })

  const content = watch("content")
  const watchedImage = watch("image")

  useEffect(() => {
    if (uploadingImage) return
    if (watchedImage && watchedImage !== imagePreview) {
      setImagePreview(watchedImage)
    }
    if (!watchedImage && imagePreview) {
      setImagePreview("")
    }
  }, [watchedImage, uploadingImage, imagePreview])

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/uploads/news", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error || "Failed to upload image")
      }

      const data = await response.json()
      setValue("image", data.url || "")
      setImagePreview(data.url || "")
    } catch (err: any) {
      alert(err.message || "Failed to upload image")
    } finally {
      setUploadingImage(false)
    }
  }

  const onSubmit = async (data: NewsFormData) => {
    setLoading(true)
    setError("")

    try {
      const url = news ? `/api/news/${news.id}` : "/api/news"
      const method = news ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          image: data.image || imagePreview || "",
          publishedAt: data.publishedAt || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save news")
      }

      router.push("/admin/news")
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
          <CardTitle>Article Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Article title"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              {...register("excerpt")}
              placeholder="Brief summary of the article"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Featured Image</Label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="sm:w-48 sm:h-48 w-full aspect-square rounded-lg border border-dashed border-indigo-200 flex items-center justify-center bg-white/60 overflow-hidden">
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <Image src={imagePreview} alt="Featured image" fill className="object-cover" />
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center px-4">
                    No image uploaded
                  </p>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? "Uploading..." : "Upload Image"}
                  </Button>
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        setImagePreview("")
                        setValue("image", "")
                        if (fileInputRef.current) fileInputRef.current.value = ""
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <Input
                  id="image"
                  {...register("image")}
                  placeholder="Upload an image or paste URL"
                />
                <p className="text-xs text-gray-500">
                  Recommended size 1200×800px. You can upload an image or paste an existing URL.
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  handleImageUpload(file)
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <RichTextEditor
              content={content}
              onChange={(newContent) => setValue("content", newContent)}
            />
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publish Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="featured"
              {...register("featured")}
              className="rounded border-gray-300"
            />
            <Label htmlFor="featured" className="cursor-pointer">
              Feature this article
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="publishedAt">Publish Date</Label>
            <Input
              id="publishedAt"
              type="date"
              {...register("publishedAt")}
            />
            <p className="text-sm text-gray-500">
              Leave empty to save as draft
            </p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : news ? "Update Article" : "Create Article"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/news")}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

