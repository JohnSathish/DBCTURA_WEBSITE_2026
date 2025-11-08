import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import DownloadForm from "@/components/admin/downloads/DownloadForm"

export default async function NewDownloadPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Download</h1>
          <p className="text-gray-600 mt-2">Add a new downloadable file</p>
        </div>

        <DownloadForm />
      </div>
    </AdminLayout>
  )
}


