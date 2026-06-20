import { COURSE_CATALOG, isCourseCode } from "@/lib/courseCatalog"
import BreadcrumbTitleSetter from "@/components/layout/BreadcrumbTitleSetter"
import CourseApplyForm from "@/components/course/CourseApplyForm"

export default async function CourseApplyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const courseRaw = String(sp.course || "").trim().toUpperCase()
  const courseCode = isCourseCode(courseRaw) ? courseRaw : null
  const courseName = courseCode ? COURSE_CATALOG[courseCode] : null

  return (
    <div className="min-h-screen bg-brand-surface py-8 md:py-12">
      <BreadcrumbTitleSetter title={courseName ? `Apply - ${courseName}` : "Course Application"} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-text">Course Application / Enquiry</h1>
          <p className="mt-2 text-slate-600">
            {courseName ? (
              <>
                Applying for <span className="font-semibold text-slate-900">{courseName}</span> ({courseCode})
              </>
            ) : (
              "Select a course from the list and submit your details."
            )}
          </p>
        </div>

        <CourseApplyForm initialCourseCode={courseCode} />
      </div>
    </div>
  )
}

