import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import NoticeForm from "@/components/admin/notice-board/NoticeForm"

export default async function EditNoticePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  const { id } = await params
  const notice = await prisma.noticeBoardNotice.findUnique({ where: { id } })
  if (!notice) redirect("/admin/notice-board/notices")

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Edit Notice
          </h1>
          <p className="mt-1 text-slate-600">Update notice details.</p>
        </div>
        <NoticeForm notice={notice as any} />
      </div>
    </AdminLayout>
  )
}

