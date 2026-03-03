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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload, Image as ImageIcon, X, Trash2 } from "lucide-react"
import Image from "next/image"

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  eventDate: z.string().optional(),
  albumId: z.string().min(1, "Album is required"),
  displayOrder: z.number().min(0).default(0),
})

type EventFormData = z.input<typeof eventSchema>

interface GalleryEvent {
  id: string
  title: string
  description: string | null
  eventDate: Date | null
  albumId: string
  displayOrder: number
}

interface EventFormProps {
  event?: GalleryEvent
  albums: Array<{ id: string; title: string }>
  defaultAlbumId?: string
}

export default function EventForm({ event, albums, defaultAlbumId }: EventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [uploadedImages, setUploadedImages] = useState<Array<{ id?: string; url: string }>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: event
      ? {
          title: event.title,
          description: event.description || "",
          eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split("T")[0] : "",
          albumId: event.albumId,
          displayOrder: event.displayOrder,
        }
      : {
          title: "",
          description: "",
          eventDate: "",
          albumId: defaultAlbumId || albums[0]?.id || "",
          displayOrder: 0,
        },
  })

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError("")

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} is not an image file`)
        }

        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
          throw new Error(`${file.name} exceeds 5MB limit`)
        }

        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/uploads/gallery", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to upload ${file.name}`)
        }

        return await response.json()
      })

      const results = await Promise.all(uploadPromises)
      const newImages = results.map((r) => ({ url: r.filePath }))
      setUploadedImages((prev) => [...prev, ...newImages])
    } catch (err: any) {
      setError(err.message || "Failed to upload images")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: EventFormData) => {
    if (!event && uploadedImages.length === 0) {
      setError("Please upload at least one image")
      return
    }

    setLoading(true)
    setError("")

    try {
      const url = event ? `/api/gallery/events/${event.id}` : "/api/gallery/events"
      const method = event ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          displayOrder: typeof data.displayOrder === "number" ? data.displayOrder : 0,
          eventDate: data.eventDate || null,
          images: uploadedImages.map((img) => img.url),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save event")
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
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Event title"
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
              placeholder="Brief description of the event"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="albumId">Album *</Label>
            <Select value={watch("albumId") || ""} onValueChange={(value) => setValue("albumId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select album" />
              </SelectTrigger>
              <SelectContent>
                {albums.map((album) => (
                  <SelectItem key={album.id} value={album.id}>
                    {album.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.albumId && (
              <p className="text-sm text-red-600">{errors.albumId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventDate">Event Date</Label>
            <Input
              id="eventDate"
              type="date"
              {...register("eventDate")}
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Photos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {uploadedImages.map((img, index) => (
                <div key={index} className="relative aspect-square group">
                  <Image
                    src={img.url}
                    alt={`Upload ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              ref={fileInputRef}
              type="file"
              id="images"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
              accept="image/*"
              multiple
            />
            <label
              htmlFor="images"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-700">
                {uploading ? "Uploading..." : "Click to upload photos"}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                JPG, PNG, GIF, WebP (Max 5MB each) - You can select multiple files
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading || uploading || (!event && uploadedImages.length === 0)}>
          {loading ? "Saving..." : uploading ? "Uploading..." : event ? "Update Event" : "Create Event"}
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

