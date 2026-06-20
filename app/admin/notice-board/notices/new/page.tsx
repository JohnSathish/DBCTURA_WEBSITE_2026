import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import NoticeForm from "@/components/admin/notice-board/NoticeForm"

export default async function NewNoticePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            New Notice
          </h1>
          <p className="mt-1 text-slate-600">Create a new notice for students.</p>
        </div>
        <NoticeForm />
      </div>
    </AdminLayout>
  )
}

