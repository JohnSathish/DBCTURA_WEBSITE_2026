import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import GalleryForm from "@/components/admin/gallery/GalleryForm"

export default async function EditGalleryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const { id } = await params

  const galleryImage = await prisma.galleryImage.findUnique({
    where: { id },
  })

  if (!galleryImage) {
    redirect("/admin/gallery")
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Gallery Image</h1>
          <p className="text-gray-600 mt-2">Update gallery image information</p>
        </div>

        <GalleryForm galleryImage={galleryImage} />
      </div>
    </AdminLayout>
  )
}


