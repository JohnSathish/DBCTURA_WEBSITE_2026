import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import PopupList from "@/components/admin/popup/PopupList"

export default async function PopupPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const popups = await prisma.popupBanner.findMany({
    orderBy: { updatedAt: "desc" },
  })

  return (
    <AdminLayout>
      <PopupList initialPopups={popups} />
    </AdminLayout>
  )
}



