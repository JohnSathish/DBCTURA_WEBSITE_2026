import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import AlbumForm from "@/components/admin/gallery/AlbumForm"

export default async function NewAlbumPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const parentAlbums = await prisma.galleryAlbum.findMany({
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
          <h1 className="text-3xl font-bold text-gray-900">Create New Album</h1>
          <p className="text-gray-600 mt-2">Create a new gallery album</p>
        </div>

        <AlbumForm parentAlbums={parentAlbums} />
      </div>
    </AdminLayout>
  )
}


