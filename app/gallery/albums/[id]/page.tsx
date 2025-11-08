import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const album = await prisma.galleryAlbum.findUnique({
    where: { id },
    include: {
      parentAlbum: {
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

  if (!album) {
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
        <h1 className="text-4xl font-bold mb-2">{album.title}</h1>
        {album.description && (
          <p className="text-gray-700 mt-4 text-lg">{album.description}</p>
        )}
        {album.parentAlbum && (
          <p className="text-sm text-gray-500 mt-2">
            Parent Album:{" "}
            <Link href={`/gallery/albums/${album.parentAlbum.id}`} className="hover:underline">
              {album.parentAlbum.title}
            </Link>
          </p>
        )}
      </div>

      {album.images.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No images in this album yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {album.images.map((image) => (
            <div
              key={image.id}
              className="relative aspect-square overflow-hidden rounded-lg bg-gray-200 group cursor-pointer"
            >
              <Image
                src={image.image}
                alt={image.title || album.title || "Gallery image"}
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

