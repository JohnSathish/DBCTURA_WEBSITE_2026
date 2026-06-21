import BreadcrumbTitleSetter from "@/components/layout/BreadcrumbTitleSetter"
import QuestionPaperBrowser from "@/components/question-papers/QuestionPaperBrowser"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Question Papers | Don Bosco College, Tura",
  description: "Browse and download previous year question papers by department, semester, and subject.",
}

export default async function QuestionPapersPage() {
  let papers: Awaited<ReturnType<typeof prisma.questionPaper.findMany>> = []
  try {
    papers = await prisma.questionPaper.findMany({
      where: { published: true },
      orderBy: [
        { examYear: "desc" },
        { academicYear: "desc" },
        { department: "asc" },
        { semester: "asc" },
        { courseCode: "asc" },
      ],
    })
  } catch (error) {
    console.error("Error fetching question papers:", error)
  }

  const serialized = papers.map((p) => ({
    id: p.id,
    academicYear: p.academicYear,
    department: p.department,
    programme: p.programme,
    semester: p.semester,
    courseName: p.courseName,
    courseCode: p.courseCode,
    examType: p.examType,
    examYear: p.examYear,
    fileUrl: p.fileUrl,
    originalName: p.originalName,
  }))

  return (
    <>
      <BreadcrumbTitleSetter title="Question Papers" />
      <div className="min-h-screen bg-brand-surface py-12">
        <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
          <header className="space-y-3 text-center">
            <h1 className="font-heading text-4xl font-bold text-brand-text">Previous Year Question Papers</h1>
            <p className="mx-auto max-w-3xl text-slate-600">
              Filter by department, semester, subject, academic year, and examination type. Download PDFs for your
              programme and semester.
            </p>
          </header>
          <div className="rounded-3xl border border-brand-gold/20 bg-white/90 p-6 shadow-xl backdrop-blur sm:p-10">
            <QuestionPaperBrowser papers={serialized} />
          </div>
        </div>
      </div>
    </>
  )
}
