import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import AdminLayout from "@/components/admin/AdminLayout"
import AlumniRegistrationsManager from "@/components/admin/alumni/AlumniRegistrationsManager"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function AlumniRegistrationsAdminPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/admin/login")
  }

  const rows = await prisma.alumniRegistration.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true,
      createdAt: true,
      fullName: true,
      email: true,
      mobileNumber: true,
      department: true,
      courseProgram: true,
      yearOfGraduation: true,
      profilePhoto: true,
    },
  })

  const initialRows = rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }))

  return (
    <AdminLayout>
      <AlumniRegistrationsManager initialRows={initialRows} />
    </AdminLayout>
  )
}
