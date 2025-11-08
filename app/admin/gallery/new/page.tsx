import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import GalleryForm from "@/components/admin/gallery/GalleryForm"

export default async function NewGalleryPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Gallery Image</h1>
          <p className="text-gray-600 mt-2">Add a new image to the gallery</p>
        </div>

        <GalleryForm />
      </div>
    </AdminLayout>
  )
}


