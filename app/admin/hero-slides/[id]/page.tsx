import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import HeroSlideForm from "@/components/admin/hero-slides/HeroSlideForm"

export default async function EditHeroSlidePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const { id } = await params

  let slide: any = null
  try {
    if ((prisma as any).heroSlide) {
      slide = await prisma.heroSlide.findUnique({
        where: { id },
      })
    }
  } catch (error: any) {
    console.error("Error fetching hero slide:", error)
  }

  if (!slide) {
    redirect("/admin/hero-slides")
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Hero Slide</h1>
          <p className="text-gray-600 mt-2">Update hero slide details</p>
        </div>

        <HeroSlideForm slide={slide} />
      </div>
    </AdminLayout>
  )
}

