import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import ShortTermCoursesList from "@/components/admin/short-term-courses/ShortTermCoursesList"

export default async function ShortTermCoursesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  let courses: any[] = []
  try {
    if ((prisma as any).shortTermCourse) {
      courses = await prisma.shortTermCourse.findMany({
        orderBy: [
          { displayOrder: "asc" },
          { createdAt: "desc" },
        ],
      })
    }
  } catch (error: any) {
    console.error("Error fetching short-term courses:", error)
    courses = []
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Short-Term Courses</h1>
            <p className="text-gray-600 mt-2">Manage short-term courses offered by the college</p>
          </div>
          <a
            href="/admin/short-term-courses/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New Course
          </a>
        </div>

        <ShortTermCoursesList initialCourses={courses} />
      </div>
    </AdminLayout>
  )
}

