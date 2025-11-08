import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import AlbumForm from "@/components/admin/gallery/AlbumForm"

export default async function EditAlbumPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const { id } = await params

  const album = await prisma.galleryAlbum.findUnique({
    where: { id },
  })

  if (!album) {
    redirect("/admin/gallery")
  }

  const parentAlbums = await prisma.galleryAlbum.findMany({
    where: {
      id: { not: id },
    },
    select: {
      id: true,
      title: true,
    },
    orderBy: { title: "asc" },
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Album</h1>
          <p className="text-gray-600 mt-2">Update album details</p>
        </div>

        <AlbumForm album={album} parentAlbums={parentAlbums} />
      </div>
    </AdminLayout>
  )
}

