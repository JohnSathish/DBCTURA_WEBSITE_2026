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

const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  code: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  duration: z.string().optional(),
  fees: z.string().optional(),
  displayOrder: z.number().min(0).default(0),
  published: z.boolean().default(true),
})

type CourseFormData = z.infer<typeof courseSchema>

interface Course {
  id: string
  title: string
  code: string | null
  description: string | null
  image: string | null
  duration: string | null
  fees: string | null
  displayOrder: number
  published: boolean
}

interface CourseFormProps {
  course?: Course
}

export default function CourseForm({ course }: CourseFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [uploadedImage, setUploadedImage] = useState<{ url: string } | null>(
    course?.image ? { url: course.image } : null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: course
      ? {
          title: course.title,
          code: course.code || "",
          description: course.description || "",
          image: course.image || "",
          duration: course.duration || "",
          fees: course.fees || "",
          displayOrder: course.displayOrder,
          published: course.published,
        }
      : {
          title: "",
          code: "",
          description: "",
          image: "",
          duration: "",
          fees: "",
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

      const response = await fetch("/api/uploads/courses", {
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

  const onSubmit = async (data: CourseFormData) => {
    setLoading(true)
    setError("")

    try {
      const url = course ? `/api/short-term-courses/${course.id}` : "/api/short-term-courses"
      const method = course ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          code: data.code || null,
          description: data.description || null,
          image: data.image || null,
          duration: data.duration || null,
          fees: data.fees || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save course")
      }

      router.push("/admin/short-term-courses")
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
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="e.g., Basic Course in Tally ERP9"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Course Code</Label>
            <Input
              id="code"
              {...register("code")}
              placeholder="e.g., BCTE"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Course description"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              {...register("duration")}
              placeholder="e.g., 3 months"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fees">Fees</Label>
            <Input
              id="fees"
              {...register("fees")}
              placeholder="e.g., ₹5,000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Course Image (Optional)</Label>
            {uploadedImage ? (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="relative w-full max-w-xs mb-3 rounded-lg overflow-hidden bg-gray-200">
                  <Image
                    src={uploadedImage.url}
                    alt="Course image"
                    width={300}
                    height={200}
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
                    {uploading ? "Uploading..." : "Click to upload course image"}
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
          {loading ? "Saving..." : uploading ? "Uploading..." : course ? "Update Course" : "Create Course"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/short-term-courses")}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

