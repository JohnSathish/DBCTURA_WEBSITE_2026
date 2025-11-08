"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Image as ImageIcon, X } from "lucide-react"
import Image from "next/image"

const gallerySchema = z.object({
  title: z.string().min(1, "Title is required"),
  image: z.string().min(1, "Image is required"),
  category: z.string().optional(),
  displayOrder: z.number().min(0).default(0),
})

type GalleryFormData = z.infer<typeof gallerySchema>

interface GalleryImage {
  id: string
  title: string
  image: string
  category: string | null
  displayOrder: number
}

export default function GalleryForm({ galleryImage }: { galleryImage?: GalleryImage }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [uploadedImage, setUploadedImage] = useState<{ url: string } | null>(
    galleryImage ? { url: galleryImage.image } : null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<GalleryFormData>({
    resolver: zodResolver(gallerySchema),
    defaultValues: galleryImage
      ? {
          title: galleryImage.title,
          image: galleryImage.image,
          category: galleryImage.category || "",
          displayOrder: galleryImage.displayOrder,
        }
      : {
          title: "",
          image: "",
          category: "",
          displayOrder: 0,
        },
  })

  const imagePath = watch("image")

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setError("Image size exceeds 5MB limit")
      return
    }

    setUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/uploads/gallery", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload image")
      }

      const result = await response.json()
      setValue("image", result.filePath)
      setUploadedImage({ url: result.filePath })
    } catch (err: any) {
      setError(err.message || "Failed to upload image")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setValue("image", "")
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const onSubmit = async (data: GalleryFormData) => {
    setLoading(true)
    setError("")

    try {
      const url = galleryImage ? `/api/gallery/${galleryImage.id}` : "/api/gallery"
      const method = galleryImage ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save gallery image")
      }

      router.push("/admin/gallery")
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
          <CardTitle>Gallery Image Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Image title"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image *</Label>
            {uploadedImage ? (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="relative aspect-video w-full max-w-md mb-3 rounded-lg overflow-hidden bg-gray-200">
                  <Image
                    src={uploadedImage.url}
                    alt="Uploaded image"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{uploadedImage.url}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeImage}
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
                  id="image"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                  accept="image/*"
                />
                <label
                  htmlFor="image"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">
                    {uploading ? "Uploading..." : "Click to upload image"}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    JPG, PNG, GIF, WebP (Max 5MB)
                  </span>
                </label>
              </div>
            )}
            {errors.image && (
              <p className="text-sm text-red-600">{errors.image.message}</p>
            )}
            <input type="hidden" {...register("image")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              {...register("category")}
              placeholder="Events, Campus, Sports, etc."
            />
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
            <p className="text-sm text-gray-500">
              Lower numbers appear first (0 = first)
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
        <Button type="submit" disabled={loading || uploading || !imagePath}>
          {loading ? "Saving..." : uploading ? "Uploading..." : galleryImage ? "Update Image" : "Add Image"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/gallery")}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}


