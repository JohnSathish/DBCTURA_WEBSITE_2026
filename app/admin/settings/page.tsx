import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import FlashNewsSettings from "@/components/admin/settings/FlashNewsSettings"
import AdmissionLinksSettings from "@/components/admin/settings/AdmissionLinksSettings"
import { getAdmissionLinksConfig } from "@/lib/get-admission-links-config"
import { prisma } from "@/lib/prisma"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const [flashNews, admissionConfig] = await Promise.all([
    prisma.setting.findUnique({ where: { key: "flash_news" } }),
    getAdmissionLinksConfig(),
  ])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage website settings</p>
        </div>

        <AdmissionLinksSettings initialConfig={admissionConfig} />

        <FlashNewsSettings initialValue={flashNews?.value || ""} />
      </div>
    </AdminLayout>
  )
}
