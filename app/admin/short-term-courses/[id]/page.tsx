import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import CourseForm from "@/components/admin/short-term-courses/CourseForm"

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const { id } = await params

  let course: any = null
  try {
    if ((prisma as any).shortTermCourse) {
      course = await prisma.shortTermCourse.findUnique({
        where: { id },
      })
    }
  } catch (error: any) {
    console.error("Error fetching course:", error)
  }

  if (!course) {
    redirect("/admin/short-term-courses")
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
          <p className="text-gray-600 mt-2">Update course details</p>
        </div>

        <CourseForm course={course} />
      </div>
    </AdminLayout>
  )
}

