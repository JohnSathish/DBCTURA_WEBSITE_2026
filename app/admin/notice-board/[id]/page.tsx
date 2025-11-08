import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import EventForm from "@/components/admin/notice-board/EventForm"

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

  const event = await prisma.noticeBoardEvent.findUnique({
    where: { id },
  })

  if (!event) {
    redirect("/admin/notice-board")
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
          <p className="text-gray-600 mt-2">Update event details</p>
        </div>

        <EventForm event={event} />
      </div>
    </AdminLayout>
  )
}

