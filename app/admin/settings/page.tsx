import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import FlashNewsSettings from "@/components/admin/settings/FlashNewsSettings"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const flashNews = await prisma.setting.findUnique({
    where: { key: "flash_news" },
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage website settings</p>
        </div>

        <FlashNewsSettings initialValue={flashNews?.value || ""} />
      </div>
    </AdminLayout>
  )
}



