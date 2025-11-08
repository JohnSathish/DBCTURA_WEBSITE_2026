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
import { Switch } from "@/components/ui/switch"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

const heroSlideSchema = z.object({
  image: z.string().min(1, "Image is required"),
  caption: z.string().optional(),
  displayOrder: z.number().min(0).default(0),
  published: z.boolean().default(true),
})

type HeroSlideFormData = z.infer<typeof heroSlideSchema>

interface HeroSlide {
  id: string
  image: string
  caption: string | null
  displayOrder: number
  published: boolean
}

interface HeroSlideFormProps {
  slide?: HeroSlide
}

export default function HeroSlideForm({ slide }: HeroSlideFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [uploadedImage, setUploadedImage] = useState<{ url: string } | null>(
    slide?.image ? { url: slide.image } : null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<HeroSlideFormData>({
    resolver: zodResolver(heroSlideSchema),
    defaultValues: slide
      ? {
          image: slide.image,
          caption: slide.caption || "",
          displayOrder: slide.displayOrder,
          published: slide.published,
        }
      : {
          image: "",
          caption: "",
          displayOrder: 0,
          published: true,
        },
  })

  const published = watch("published")

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setError("Image size exceeds 10MB limit")
      return
    }

    setUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/uploads/hero", {
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

  const onSubmit = async (data: HeroSlideFormData) => {
    setLoading(true)
    setError("")

    try {
      const url = slide ? `/api/hero-slides/${slide.id}` : "/api/hero-slides"
      const method = slide ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          caption: data.caption || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save hero slide")
      }

      router.push("/admin/hero-slides")
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
          <CardTitle>Hero Slide Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">Hero Image *</Label>
            {uploadedImage ? (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="relative w-full max-w-2xl mb-3 rounded-lg overflow-hidden bg-gray-200">
                  <Image
                    src={uploadedImage.url}
                    alt="Hero slide"
                    width={800}
                    height={400}
                    className="object-cover w-full"
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
                    {uploading ? "Uploading..." : "Click to upload hero image"}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    JPG, PNG, GIF, WebP (Max 10MB)
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
            <Label htmlFor="caption">Caption (Optional)</Label>
            <Input
              id="caption"
              {...register("caption")}
              placeholder="e.g., Campus Aerial View"
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
          {loading ? "Saving..." : uploading ? "Uploading..." : slide ? "Update Hero Slide" : "Create Hero Slide"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/hero-slides")}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

