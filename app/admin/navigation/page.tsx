import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import AdminLayout from "@/components/admin/AdminLayout"
import NavigationManager from "@/components/admin/navigation/NavigationManager"

export default async function NavigationPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  return (
    <AdminLayout>
      <NavigationManager />
    </AdminLayout>
  )
}


