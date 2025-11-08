"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Upload, X } from "lucide-react"
import Link from "next/link"
import AdminLayout from "@/components/admin/AdminLayout"

interface AlbumImage {
  id: string
  title: string | null
  image: string
}

interface AlbumData {
  id: string
  title: string
  images: AlbumImage[]
}

export default function AlbumDetailPageClient({ id }: { id: string }) {
  const router = useRouter()
  const [album, setAlbum] = useState<AlbumData | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`/api/gallery/albums/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setAlbum(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    setDeleting(imageId)
    try {
      const response = await fetch(`/api/gallery/images/${imageId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setAlbum((prev) =>
          prev
            ? {
                ...prev,
                images: prev.images.filter((img) => img.id !== imageId),
              }
            : null
        )
      }
    } catch (error) {
      alert("Failed to delete image")
    } finally {
      setDeleting(null)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append("files", file)
      })
      formData.append("albumId", id)

      const response = await fetch("/api/gallery/images", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const newImages = await response.json()
        setAlbum((prev) =>
          prev
            ? {
                ...prev,
                images: [...prev.images, ...newImages],
              }
            : null
        )
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        alert("Failed to upload images")
      }
    } catch (error) {
      alert("Failed to upload images")
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p>Loading...</p>
        </div>
      </AdminLayout>
    )
  }

  if (!album) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p>Album not found</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{album.title}</h1>
            <p className="text-gray-600 mt-2">{album.images.length} photos</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/gallery/albums/${id}/edit`}>
              <Button variant="outline">Edit Album</Button>
            </Link>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
              id="image-upload"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Upload Photos"}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Album Photos</CardTitle>
          </CardHeader>
          <CardContent>
            {album.images.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No photos uploaded yet. Click "Upload Photos" to add images.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {album.images.map((image) => (
                  <div key={image.id} className="relative aspect-square group">
                    <Image
                      src={image.image}
                      alt={image.title || "Album photo"}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      onClick={() => handleDeleteImage(image.id)}
                      disabled={deleting === image.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

