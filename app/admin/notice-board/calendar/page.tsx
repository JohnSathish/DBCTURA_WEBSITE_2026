import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import CalendarEventForm from "@/components/admin/notice-board/CalendarEventForm"

export default async function CalendarEventPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Create Events via Calendar</h1>
        <CalendarEventForm />
      </div>
    </AdminLayout>
  )
}



