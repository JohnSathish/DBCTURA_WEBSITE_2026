import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import AdminLayout from "@/components/admin/AdminLayout"
import BloodDonorManager from "@/components/admin/blood-donors/BloodDonorManager"
import { authOptions } from "@/lib/auth"

export default async function AdminBloodDonorsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  return (
    <AdminLayout>
      <BloodDonorManager />
    </AdminLayout>
  )
}


