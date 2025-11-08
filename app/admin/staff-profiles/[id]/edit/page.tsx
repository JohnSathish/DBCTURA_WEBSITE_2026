import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import StaffForm from "@/components/admin/staff-profiles/StaffForm"
import { notFound } from "next/navigation"

export default async function EditStaffProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const { id } = await params
  const staff = await prisma.staffProfile.findUnique({
    where: { id },
  })

  if (!staff) {
    notFound()
  }

  return (
    <AdminLayout>
      <StaffForm initialData={staff} />
    </AdminLayout>
  )
}



