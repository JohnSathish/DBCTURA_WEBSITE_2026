import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarClock, IndianRupee, Tag } from "lucide-react"
import BreadcrumbTitleSetter from "@/components/layout/BreadcrumbTitleSetter"

export default async function ShortTermCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let course: any = null
  try {
    if (!(prisma as any).shortTermCourse) {
      notFound()
    }
    course = await prisma.shortTermCourse.findUnique({ where: { id } })
  } catch {
    notFound()
  }

  if (!course || !course.published) {
    notFound()
  }

  let otherCourses: any[] = []
  try {
    otherCourses = await prisma.shortTermCourse.findMany({
      where: { published: true, NOT: { id } },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      take: 4,
      select: { id: true, title: true, code: true, image: true },
    })
  } catch {
    otherCourses = []
  }

  return (
    <div className="min-h-screen bg-brand-surface">
      <BreadcrumbTitleSetter title={course.title} />

      {/* Hero — solid brand background (course image shown in body below) */}
      <div className="bg-brand-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/short-term-courses"
                className="inline-flex items-center gap-2 text-sm text-white/85 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Short-Term Courses
              </Link>

              <Link
                href="/"
                className="text-sm text-white/75 hover:text-white transition-colors"
              >
                Go to Home
              </Link>
            </div>

            {course.code ? (
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-3 py-1 text-xs font-semibold ring-1 ring-white/15">
                <Tag className="h-3.5 w-3.5" />
                {course.code}
              </div>
            ) : null}

            <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              {course.title}
            </h1>

            {course.description ? (
              <p className="mt-4 max-w-3xl text-base sm:text-lg text-white/85 leading-relaxed line-clamp-3">
                {course.description}
              </p>
            ) : null}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 md:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <main className="lg:col-span-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden">
              {course.image ? (
                <div className="relative w-full aspect-[16/9] bg-slate-100">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 48rem"
                    priority={false}
                  />
                </div>
              ) : null}

              <div className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-brand-text">Course Overview</h2>
                <div className="mt-4 prose max-w-none text-slate-700">
                  <p className="whitespace-pre-line leading-relaxed">
                    {course.description || "Details will be updated soon."}
                  </p>
                </div>
              </div>
            </div>
          </main>

          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6">
                <h3 className="text-base font-bold text-brand-text">Quick Info</h3>
                <div className="mt-4 space-y-3">
                  {course.duration ? (
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 grid place-items-center">
                        <CalendarClock className="h-4 w-4 text-slate-700" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Duration</div>
                        <div className="text-sm font-medium text-slate-900 break-words">{course.duration}</div>
                      </div>
                    </div>
                  ) : null}
                  {course.fees ? (
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 grid place-items-center">
                        <IndianRupee className="h-4 w-4 text-slate-700" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Fees</div>
                        <div className="text-sm font-medium text-slate-900 break-words">{course.fees}</div>
                      </div>
                    </div>
                  ) : null}
                  {course.code ? (
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 grid place-items-center">
                        <Tag className="h-4 w-4 text-slate-700" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Course Code</div>
                        <div className="text-sm font-medium text-slate-900 break-words">{course.code}</div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3">
                  <Link
                    href={`/course/apply?course=${encodeURIComponent(course.code || "")}`}
                    className="inline-flex items-center justify-center rounded-xl bg-brand-navy px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-navy-deep transition-colors"
                  >
                    Apply / Enquire
                  </Link>
                  <Link
                    href="/short-term-courses"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    View all courses
                  </Link>
                </div>
              </div>

              {otherCourses.length > 0 ? (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6">
                  <h3 className="text-base font-bold text-brand-text">Other Courses</h3>
                  <div className="mt-4 space-y-3">
                    {otherCourses.map((c) => (
                      <Link
                        key={c.id}
                        href={`/short-term-courses/${c.id}`}
                        className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          {c.image ? (
                            <Image src={c.image} alt={c.title} fill className="object-cover" sizes="3rem" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate group-hover:text-brand-hover transition-colors">
                            {c.title}
                          </div>
                          {c.code ? <div className="text-xs text-slate-500 truncate">{c.code}</div> : null}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

