import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Folder, FolderOpen } from "lucide-react"

export default async function GalleryPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const albums = await prisma.galleryAlbum.findMany({
    where: { parentAlbumId: null },
    include: {
      childAlbums: true,
      _count: {
        select: { images: true, childAlbums: true },
      },
    },
    orderBy: { displayOrder: "asc" },
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gallery Albums</h1>
            <p className="text-gray-600 mt-2">Manage albums and upload photos</p>
          </div>
          <Link href="/admin/gallery/albums/new">
            <Button>Create Album</Button>
          </Link>
        </div>

        {albums.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No albums yet. Create your first album!
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {albums.map((album) => (
              <Card key={album.id} className="hover:shadow-lg transition-shadow">
                <Link href={`/admin/gallery/albums/${album.id}`}>
                  <div className="aspect-square relative bg-gray-200 rounded-t-lg overflow-hidden">
                    {album.coverImage ? (
                      <Image
                        src={album.coverImage}
                        alt={album.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                        <FolderOpen className="h-16 w-16 text-blue-500" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-1">{album.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{album.childAlbums.length} Sub-albums</span>
                      <span>{album._count.images} Photos</span>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
