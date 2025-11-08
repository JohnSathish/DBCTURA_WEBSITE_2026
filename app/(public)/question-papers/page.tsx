import { prisma } from "@/lib/prisma"
import QuestionPaperBrowser from "@/components/question-papers/QuestionPaperBrowser"

export const dynamic = "force-dynamic"

async function getQuestionPapers() {
  try {
    const papers = await prisma.questionPaper.findMany({
      orderBy: [{ year: "desc" }, { department: "asc" }, { originalName: "asc" }],
    })
    return papers
  } catch (error) {
    console.error("Error fetching question papers:", error)
    return []
  }
}

export default async function QuestionPapersPage() {
  const papers = await getQuestionPapers()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="space-y-3 text-center">
          <h1 className="text-4xl font-bold text-indigo-900">Question Papers</h1>
          <p className="text-slate-600 max-w-3xl mx-auto">
            Browse question papers by academic year and department. Select a year to get started, then choose your
            department to view available documents.
          </p>
        </header>

        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-indigo-100 p-6 sm:p-10">
          <QuestionPaperBrowser initialPapers={papers} />
        </div>
      </div>
    </div>
  )
}



