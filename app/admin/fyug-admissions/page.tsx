import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import AdminLayout from "@/components/admin/AdminLayout"
import FyugAdmissionManager from "@/components/admin/fyug-admissions/FyugAdmissionManager"
import { authOptions } from "@/lib/auth"

export default async function AdminFyugAdmissionsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  return (
    <AdminLayout>
      <FyugAdmissionManager />
    </AdminLayout>
  )
}
