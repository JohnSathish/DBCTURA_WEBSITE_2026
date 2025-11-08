import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import EventForm from "@/components/admin/gallery/EventForm"

export default async function NewEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const { id: albumId } = await params

  const albums = await prisma.galleryAlbum.findMany({
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
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          <p className="text-gray-600 mt-2">Create a new event with photos</p>
        </div>

        <EventForm albums={albums} defaultAlbumId={albumId} />
      </div>
    </AdminLayout>
  )
}

