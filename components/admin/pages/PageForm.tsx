"use client"

import { useState } from "react"
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

const pageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string(),
  featuredImage: z
    .string()
    .optional()
    .refine(
      (val) => {
        const s = (val ?? "").trim()
        if (!s) return true
        if (s.startsWith("/")) return true
        try {
          const u = new URL(s)
          return u.protocol === "http:" || u.protocol === "https:"
        } catch {
          return false
        }
      },
      { message: "Use a full URL (https://...) or a site path starting with /" }
    ),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  published: z.boolean(),
})

type PageFormData = z.infer<typeof pageSchema>

interface Page {
  id: string
  title: string
  slug: string
  content: string
  featuredImage: string | null
  metaTitle: string | null
  metaDescription: string | null
  published: boolean
}

export default function PageForm({ page }: { page?: Page }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: page
      ? {
          title: page.title,
          slug: page.slug,
          content: page.content,
          featuredImage: page.featuredImage || "",
          metaTitle: page.metaTitle || "",
          metaDescription: page.metaDescription || "",
          published: page.published,
        }
      : {
          title: "",
          slug: "",
          content: "",
          featuredImage: "",
          metaTitle: "",
          metaDescription: "",
          published: false,
        },
  })

  const content = watch("content")
  const title = watch("title")
  const published = watch("published")

  // Auto-generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const onSubmit = async (data: PageFormData) => {
    setLoading(true)
    setError("")

    try {
      const url = page ? `/api/pages/${page.id}` : "/api/pages"
      const method = page ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save page")
      }

      router.push("/admin/pages")
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
          <CardTitle>Page Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("title")}
              onChange={(e) => {
                register("title").onChange(e)
                if (!page) {
                  setValue("slug", generateSlug(e.target.value))
                }
              }}
              placeholder="Page title"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="page-slug"
            />
            {errors.slug && (
              <p className="text-sm text-red-600">{errors.slug.message}</p>
            )}
            <p className="text-sm text-gray-500">
              URL-friendly version of the title (e.g., "about-us")
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="featuredImage">Featured image (optional)</Label>
            <Input
              id="featuredImage"
              {...register("featuredImage")}
              placeholder="https://… or /uploads/your-photo.jpg"
            />
            {errors.featuredImage && (
              <p className="text-sm text-red-600">{errors.featuredImage.message as string}</p>
            )}
            <p className="text-sm text-gray-500">
              For the page with slug <span className="font-mono">principal-message</span>, this image is shown as the
              principal portrait on the homepage and on <span className="font-mono">/principal-message</span>. Leave
              blank to use the default site image.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <RichTextEditor
              content={content}
              onChange={(newContent) => setValue("content", newContent)}
              fileUploadEndpoint="/api/uploads/download"
              allowFileAttachments
            />
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              {...register("metaTitle")}
              placeholder="SEO title (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              {...register("metaDescription")}
              placeholder="SEO description (optional)"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publish Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="published"
              {...register("published")}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <Label htmlFor="published" className="cursor-pointer text-base font-medium">
              Publish this page
            </Label>
          </div>
          {published ? (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                This page will be visible to the public when saved.
              </p>
            </div>
          ) : (
            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                This page will be saved as a draft and will not be visible to the public.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : page ? "Update Page" : "Create Page"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/pages")}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

