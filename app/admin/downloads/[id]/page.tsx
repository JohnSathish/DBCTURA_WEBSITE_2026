import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import DownloadForm from "@/components/admin/downloads/DownloadForm"

export default async function EditDownloadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const { id } = await params

  const download = await prisma.download.findUnique({
    where: { id },
  })

  if (!download) {
    redirect("/admin/downloads")
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Download</h1>
          <p className="text-gray-600 mt-2">Update download information</p>
        </div>

        <DownloadForm download={download} />
      </div>
    </AdminLayout>
  )
}


