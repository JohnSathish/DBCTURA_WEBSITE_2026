import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import ShortTermCoursesList from "@/components/admin/short-term-courses/ShortTermCoursesList"
import Link from "next/link"

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Short-Term Courses
            </h1>
            <p className="mt-1 text-sm sm:text-base text-slate-600">
              Manage short-term courses offered by the college
            </p>
          </div>
          <Link
            href="/admin/short-term-courses/new"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-colors"
          >
            Add New Course
          </Link>
        </div>

        <ShortTermCoursesList initialCourses={courses} />
      </div>
    </AdminLayout>
  )
}

