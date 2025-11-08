import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import AdminLayout from "@/components/admin/AdminLayout"
import GrievanceManager from "@/components/admin/grievances/GrievanceManager"
import { authOptions } from "@/lib/auth"

export default async function GrievancesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  return (
    <AdminLayout>
      <GrievanceManager />
    </AdminLayout>
  )
}


