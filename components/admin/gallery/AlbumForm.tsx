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
import { Upload, Image as ImageIcon, X } from "lucide-react"
import Image from "next/image"

const albumSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  parentAlbumId: z.string().optional(),
  displayOrder: z.number().min(0).default(0),
})

type AlbumFormData = z.input<typeof albumSchema>

interface GalleryAlbum {
  id: string
  title: string
  description: string | null
  coverImage: string | null
  parentAlbumId: string | null
  displayOrder: number
}

interface AlbumFormProps {
  album?: GalleryAlbum
  parentAlbums: Array<{ id: string; title: string }>
  defaultParentId?: string
}

export default function AlbumForm({ album, parentAlbums, defaultParentId }: AlbumFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [error, setError] = useState("")
  const [uploadedImage, setUploadedImage] = useState<{ url: string } | null>(
    album?.coverImage ? { url: album.coverImage } : null
  )
  const [uploadedPhotos, setUploadedPhotos] = useState<Array<{ url: string; file: File }>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const photosInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AlbumFormData>({
    resolver: zodResolver(albumSchema),
    defaultValues: album
      ? {
          title: album.title,
          description: album.description || "",
          coverImage: album.coverImage || "",
          parentAlbumId: album.parentAlbumId || undefined,
          displayOrder: album.displayOrder,
        }
      : {
          title: "",
          description: "",
          coverImage: "",
          parentAlbumId: defaultParentId || undefined,
          displayOrder: 0,
        },
  })

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

      const response = await fetch("/api/uploads/gallery", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload image")
      }

      const result = await response.json()
      setValue("coverImage", result.filePath)
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
    setValue("coverImage", "")
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handlePhotosUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const validFiles: File[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith("image/")) {
        setError(`Skipping ${file.name}: Not an image file`)
        continue
      }

      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        setError(`Skipping ${file.name}: File size exceeds 10MB limit`)
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    // Add to preview list
    const newPhotos = validFiles.map(file => ({
      url: URL.createObjectURL(file),
      file,
    }))
    setUploadedPhotos(prev => [...prev, ...newPhotos])
    
    if (photosInputRef.current) {
      photosInputRef.current.value = ""
    }
  }

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].url)
      updated.splice(index, 1)
      return updated
    })
  }

  const onSubmit = async (data: AlbumFormData) => {
    setLoading(true)
    setError("")

    try {
      const url = album ? `/api/gallery/albums/${album.id}` : "/api/gallery/albums"
      const method = album ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          displayOrder: typeof data.displayOrder === "number" ? data.displayOrder : 0,
          parentAlbumId: data.parentAlbumId || null,
          coverImage: data.coverImage || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save album")
      }

      const savedAlbum = await response.json()
      const albumId = savedAlbum.id

      // Upload photos if any were selected
      if (uploadedPhotos.length > 0 && albumId) {
        setUploadingPhotos(true)
        let photosError = false
        try {
          const formData = new FormData()
          uploadedPhotos.forEach((photo) => {
            formData.append("files", photo.file)
          })
          formData.append("albumId", albumId)

          const photosResponse = await fetch("/api/gallery/images", {
            method: "POST",
            body: formData,
          })

          if (!photosResponse.ok) {
            const errorData = await photosResponse.json()
            throw new Error(errorData.error || "Failed to upload photos")
          }

          // Clean up object URLs
          uploadedPhotos.forEach(photo => URL.revokeObjectURL(photo.url))
        } catch (err: any) {
          console.error("Error uploading photos:", err)
          setError(`Album created but failed to upload some photos: ${err.message}`)
          photosError = true
        } finally {
          setUploadingPhotos(false)
        }

        // Only redirect if no error occurred
        if (!photosError) {
          router.push("/admin/gallery")
          router.refresh()
        }
      } else {
        // No photos to upload, redirect immediately
        router.push("/admin/gallery")
        router.refresh()
      }
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
          <CardTitle>Album Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="e.g., Academic Year 2025-26"
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
              placeholder="Brief description of the album"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentAlbumId">Parent Album</Label>
            <Select
              value={watch("parentAlbumId") || "none"}
              onValueChange={(value) => setValue("parentAlbumId", value === "none" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent album (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Root Album)</SelectItem>
                {parentAlbums.map((parent) => (
                  <SelectItem key={parent.id} value={parent.id}>
                    {parent.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Select a parent album to create a sub-album
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image</Label>
            {uploadedImage ? (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="relative aspect-video w-full max-w-md mb-3 rounded-lg overflow-hidden bg-gray-200">
                  <Image
                    src={uploadedImage.url}
                    alt="Cover image"
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
                  id="coverImage"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                  accept="image/*"
                />
                <label
                  htmlFor="coverImage"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">
                    {uploading ? "Uploading..." : "Click to upload cover image"}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    JPG, PNG, GIF, WebP (Max 5MB)
                  </span>
                </label>
              </div>
            )}
            <input type="hidden" {...register("coverImage")} />
          </div>

          {/* Album Photos Upload Section */}
          {!album && (
            <div className="space-y-2">
              <Label htmlFor="albumPhotos">Album Photos</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  ref={photosInputRef}
                  type="file"
                  id="albumPhotos"
                  onChange={handlePhotosUpload}
                  disabled={uploadingPhotos}
                  className="hidden"
                  accept="image/*"
                  multiple
                />
                <label
                  htmlFor="albumPhotos"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">
                    {uploadingPhotos ? "Uploading..." : "Click to upload album photos"}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    JPG, PNG, GIF, WebP (Max 10MB each) - Multiple files allowed
                  </span>
                </label>
              </div>

              {uploadedPhotos.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {uploadedPhotos.length} photo{uploadedPhotos.length !== 1 ? "s" : ""} selected
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {uploadedPhotos.map((photo, index) => (
                      <div key={index} className="relative aspect-square group">
                        <Image
                          src={photo.url}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading || uploading || uploadingPhotos}>
          {loading ? "Saving..." : uploading ? "Uploading Cover..." : uploadingPhotos ? "Uploading Photos..." : album ? "Update Album" : "Create Album"}
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

