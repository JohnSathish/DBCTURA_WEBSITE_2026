import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import PopupForm from "@/components/admin/popup/PopupForm"

export default async function EditPopupPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const { id } = await params
  const popup = await prisma.popupBanner.findUnique({
    where: { id },
    include: { images: { orderBy: { createdAt: "desc" } } },
  })

  if (!popup) {
    notFound()
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Edit Popup</h1>
        <PopupForm popup={popup} />
      </div>
    </AdminLayout>
  )
}



