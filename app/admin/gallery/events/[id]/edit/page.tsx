import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import EventForm from "@/components/admin/gallery/EventForm"

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const { id } = await params

  const prismaAny = prisma as any

  if (!prismaAny.galleryEvent || typeof prismaAny.galleryEvent.findUnique !== "function") {
    redirect("/admin/gallery")
  }

  const event = await prismaAny.galleryEvent.findUnique({
    where: { id },
  })

  if (!event) {
    redirect("/admin/gallery")
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
          <p className="text-gray-600 mt-2">Update event information</p>
        </div>

        <EventForm event={event} albums={albums} />
      </div>
    </AdminLayout>
  )
}


