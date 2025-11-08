import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import HeroSlideForm from "@/components/admin/hero-slides/HeroSlideForm"

export default async function NewHeroSlidePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Hero Slide</h1>
          <p className="text-gray-600 mt-2">Add a new hero image to the homepage</p>
        </div>

        <HeroSlideForm />
      </div>
    </AdminLayout>
  )
}

