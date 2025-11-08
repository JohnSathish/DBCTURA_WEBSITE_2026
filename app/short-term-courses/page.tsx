import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export default async function ShortTermCoursesPage() {
  let courses: any[] = []
  try {
    if ((prisma as any).shortTermCourse) {
      courses = await prisma.shortTermCourse.findMany({
        where: { published: true },
        orderBy: [
          { displayOrder: "asc" },
          { createdAt: "desc" },
        ],
      })
    }
  } catch (error: any) {
    console.error("Error fetching courses:", error)
    courses = []
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Short-Term Courses
        </h1>
        <p className="text-gray-600 text-lg">
          Enhance your skills with our comprehensive short-term courses designed for professional development.
        </p>
      </div>

      {courses.length > 0 ? (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${courses.length > 5 ? 'overflow-x-auto' : ''}`}>
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {course.image && (
                <div className="relative w-full h-48">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <CardContent className="p-6">
                {course.code && (
                  <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded mb-2">
                    {course.code}
                  </span>
                )}
                <h3 className="text-xl font-bold mb-2 text-gray-900">{course.title}</h3>
                {course.description && (
                  <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                )}
                <div className="space-y-2 mb-4">
                  {course.duration && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Duration:</span>
                      <span>{course.duration}</span>
                    </div>
                  )}
                  {course.fees && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Fees:</span>
                      <span>{course.fees}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No courses available at the moment. Please check back later.</p>
        </div>
      )}
    </div>
  )
}

