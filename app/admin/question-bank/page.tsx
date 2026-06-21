import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import QuestionBankManager from "@/components/admin/question-bank/QuestionBankManager"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink, Archive } from "lucide-react"

export default async function QuestionBankPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-medium text-indigo-600">
            <Archive className="h-4 w-4" />
            Academics
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Question Bank</h1>
          <p className="mt-1.5 text-sm text-slate-600 sm:text-base">
            Previous year question paper repository with structured academic metadata and publishing controls.
          </p>
        </div>
        <Link href="/question-papers" target="_blank" className="shrink-0">
          <Button variant="outline" className="w-full sm:w-auto">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Public Page
          </Button>
        </Link>
      </div>
      <QuestionBankManager />
    </AdminLayout>
  )
}
