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
import { Upload, X, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

const testimonialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  designation: z.string().min(1, "Designation is required"),
  testimonial: z.string().min(1, "Testimonial is required"),
  image: z.string().optional(),
  displayOrder: z.number().min(0).default(0),
  published: z.boolean().default(true),
})

type TestimonialFormData = z.infer<typeof testimonialSchema>

interface Testimonial {
  id: string
  name: string
  designation: string
  testimonial: string
  image: string | null
  displayOrder: number
  published: boolean
}

interface TestimonialFormProps {
  testimonial?: Testimonial
}

export default function TestimonialForm({ testimonial }: TestimonialFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [uploadedImage, setUploadedImage] = useState<{ url: string } | null>(
    testimonial?.image ? { url: testimonial.image } : null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: testimonial
      ? {
          name: testimonial.name,
          designation: testimonial.designation,
          testimonial: testimonial.testimonial,
          image: testimonial.image || "",
          displayOrder: testimonial.displayOrder,
          published: testimonial.published,
        }
      : {
          name: "",
          designation: "",
          testimonial: "",
          image: "",
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

      const response = await fetch("/api/uploads/testimonials", {
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

  const onSubmit = async (data: TestimonialFormData) => {
    setLoading(true)
    setError("")

    try {
      const url = testimonial ? `/api/testimonials/${testimonial.id}` : "/api/testimonials"
      const method = testimonial ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          image: data.image || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save testimonial")
      }

      router.push("/admin/testimonials")
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
          <CardTitle>Testimonial Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., John Doe"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="designation">Designation *</Label>
            <Input
              id="designation"
              {...register("designation")}
              placeholder="e.g., Software Engineer"
            />
            {errors.designation && (
              <p className="text-sm text-red-600">{errors.designation.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="testimonial">Testimonial *</Label>
            <Textarea
              id="testimonial"
              {...register("testimonial")}
              placeholder="Testimonial text"
              rows={5}
            />
            {errors.testimonial && (
              <p className="text-sm text-red-600">{errors.testimonial.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Profile Image (Optional)</Label>
            {uploadedImage ? (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="relative w-32 h-32 mb-3 rounded-full overflow-hidden bg-gray-200">
                  <Image
                    src={uploadedImage.url}
                    alt="Profile image"
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
                    {uploading ? "Uploading..." : "Click to upload profile image"}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    JPG, PNG, GIF, WebP (Max 5MB)
                  </span>
                </label>
              </div>
            )}
            <input type="hidden" {...register("image")} />
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
          {loading ? "Saving..." : uploading ? "Uploading..." : testimonial ? "Update Testimonial" : "Create Testimonial"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/testimonials")}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

