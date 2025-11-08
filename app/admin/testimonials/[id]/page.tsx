import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import TestimonialForm from "@/components/admin/testimonials/TestimonialForm"

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const { id } = await params

  let testimonial: any = null
  try {
    if ((prisma as any).testimonial) {
      testimonial = await prisma.testimonial.findUnique({
        where: { id },
      })
    }
  } catch (error: any) {
    console.error("Error fetching testimonial:", error)
  }

  if (!testimonial) {
    redirect("/admin/testimonials")
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Testimonial</h1>
          <p className="text-gray-600 mt-2">Update testimonial details</p>
        </div>

        <TestimonialForm testimonial={testimonial} />
      </div>
    </AdminLayout>
  )
}

