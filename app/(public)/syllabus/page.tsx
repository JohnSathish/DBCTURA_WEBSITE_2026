import BreadcrumbTitleSetter from "@/components/layout/BreadcrumbTitleSetter"
import SyllabusBrowser from "@/components/syllabus/SyllabusBrowser"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Syllabus | Don Bosco College, Tura",
  description: "Department-wise syllabus PDFs by programme and semester.",
}

export default async function SyllabusPage() {
  let items: Awaited<ReturnType<typeof prisma.syllabus.findMany>> = []
  try {
    items = await prisma.syllabus.findMany({
      where: { published: true },
      orderBy: [
        { academicYear: "desc" },
        { department: "asc" },
        { semester: "asc" },
        { courseCode: "asc" },
      ],
    })
  } catch (error) {
    console.error("Error fetching syllabus:", error)
  }

  const serialized = items.map((item) => ({
    id: item.id,
    department: item.department,
    programme: item.programme,
    academicYear: item.academicYear,
    semester: item.semester,
    courseCode: item.courseCode,
    courseName: item.courseName,
    description: item.description,
    fileUrl: item.fileUrl,
    originalName: item.originalName,
  }))

  return (
    <>
      <BreadcrumbTitleSetter title="Syllabus" />
      <div className="min-h-screen bg-brand-surface py-12">
        <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
          <header className="space-y-3 text-center">
            <h1 className="font-heading text-4xl font-bold text-brand-text">Department-wise Syllabus</h1>
            <p className="mx-auto max-w-3xl text-slate-600">
              Browse and download syllabus PDFs by academic year, programme, department, and semester.
            </p>
          </header>
          <div className="rounded-3xl border border-brand-gold/20 bg-white/90 p-6 shadow-xl backdrop-blur sm:p-10">
            <SyllabusBrowser items={serialized} />
          </div>
        </div>
      </div>
    </>
  )
}
