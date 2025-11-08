"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2 } from "lucide-react"
import Link from "next/link"
import AdminLayout from "@/components/admin/AdminLayout"

interface EventImage {
  id: string
  title: string | null
  image: string
}

interface EventData {
  id: string
  title: string
  album: {
    title: string
  }
  images: EventImage[]
}

export default function EventDetailPageClient({ id }: { id: string }) {
  const router = useRouter()
  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/gallery/events/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data)
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
        setEvent((prev) =>
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p>Loading...</p>
        </div>
      </AdminLayout>
    )
  }

  if (!event) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p>Event not found</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            <p className="text-gray-600 mt-2">
              Album: {event.album.title} • {event.images.length} photos
            </p>
          </div>
          <Link href={`/admin/gallery/events/${event.id}/edit`}>
            <Button variant="outline">Edit Event</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Event Photos</CardTitle>
          </CardHeader>
          <CardContent>
            {event.images.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No photos uploaded yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {event.images.map((image) => (
                  <div key={image.id} className="relative aspect-square group">
                    <Image
                      src={image.image}
                      alt={image.title || "Event photo"}
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


