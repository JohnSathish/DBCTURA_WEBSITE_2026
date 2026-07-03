import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import AdminLayout from "@/components/admin/AdminLayout"
import FyugAdmissionDetail from "@/components/admin/fyug-admissions/FyugAdmissionDetail"
import { authOptions } from "@/lib/auth"

export default async function AdminFyugAdmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")
  const { id } = await params

  return (
    <AdminLayout>
      <FyugAdmissionDetail id={id} />
    </AdminLayout>
  )
}
