import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import QuestionBankManager from "@/components/admin/question-bank/QuestionBankManager"

export default async function QuestionBankPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  return (
    <AdminLayout>
      <QuestionBankManager />
    </AdminLayout>
  )
}



