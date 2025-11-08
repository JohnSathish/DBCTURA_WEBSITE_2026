import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import StaffForm from "@/components/admin/staff-profiles/StaffForm"

export default async function NewStaffProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  return (
    <AdminLayout>
      <StaffForm />
    </AdminLayout>
  )
}



