import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

type Course = {
  id?: string
  title: string
  code?: string | null
  description?: string | null
  image?: string | null
}

export default function ShortTermCoursesPremium({ courses }: { courses: Course[] }) {
  const list = courses?.length ? courses : []

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Short Term Courses</h2>
          <p className="mx-auto mt-2 max-w-2xl text-slate-600">
            Skill-focused programmes designed for professional growth and lifelong learning.
          </p>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-amber-500" />
        </div>

        {list.length === 0 ? (
          <p className="py-12 text-center text-slate-500">No short-term courses available right now.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {list.map((course, idx) => (
              <div
                key={course.id ?? `${course.title}-${idx}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-900/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#1e3a8a]/10"
              >
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  {course.image ? (
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 20vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">No image</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-heading text-base font-bold leading-snug text-slate-900">
                    {course.title}
                    {course.code ? ` (${course.code})` : ""}
                  </h3>
                  {course.description ? (
                    <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-600">{course.description}</p>
                  ) : (
                    <div className="flex-1" />
                  )}
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full rounded-xl border-2 border-amber-500/80 font-semibold text-slate-900 transition-colors hover:bg-amber-500 hover:text-slate-900"
                  >
                    <Link href={course.id ? `/short-term-courses/${course.id}` : "/short-term-courses"}>Read More</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
