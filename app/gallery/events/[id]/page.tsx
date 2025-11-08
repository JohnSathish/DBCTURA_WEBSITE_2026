import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const event = await prisma.galleryEvent.findUnique({
    where: { id },
    include: {
      album: {
        select: {
          id: true,
          title: true,
        },
      },
      images: {
        orderBy: { displayOrder: "asc" },
      },
    },
  })

  if (!event) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/gallery">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Gallery
        </Button>
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
        {event.eventDate && (
          <p className="text-gray-600">
            {new Date(event.eventDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
        {event.description && (
          <p className="text-gray-700 mt-4">{event.description}</p>
        )}
        {event.album && (
          <p className="text-sm text-gray-500 mt-2">
            Album: {event.album.title}
          </p>
        )}
      </div>

      {event.images.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No images in this event yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {event.images.map((image) => (
            <div
              key={image.id}
              className="relative aspect-square overflow-hidden rounded-lg bg-gray-200 group cursor-pointer"
            >
              <Image
                src={image.image}
                alt={image.title || event.title || "Gallery image"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {image.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-sm truncate">{image.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

