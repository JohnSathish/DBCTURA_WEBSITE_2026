import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export default async function GalleryPage() {
  const albums = await prisma.galleryAlbum.findMany({
    where: { parentAlbumId: null },
    include: {
      images: {
        orderBy: { displayOrder: "asc" },
        take: 1,
      },
      _count: {
        select: { images: true },
      },
    },
    orderBy: { displayOrder: "asc" },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Gallery</h1>

      {albums.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No gallery albums available yet.</p>
          <p className="text-sm mt-2">Albums will appear here once created from the admin panel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {albums.map((album) => {
            const coverImage = album.coverImage || album.images[0]?.image || null
            return (
              <Link key={album.id} href={`/gallery/albums/${album.id}`}>
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="aspect-[4/3] relative bg-gray-200 rounded-t-lg overflow-hidden">
                    {coverImage ? (
                      <Image
                        src={coverImage}
                        alt={album.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{album.title}</h3>
                    {album.description && (
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                        {album.description}
                      </p>
                    )}
                    <p className="text-sm text-gray-400">
                      {album._count.images} {album._count.images === 1 ? "photo" : "photos"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

