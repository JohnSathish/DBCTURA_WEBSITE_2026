import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import NewsForm from "@/components/admin/news/NewsForm"

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const { id } = await params

  const news = await prisma.news.findUnique({
    where: { id },
    include: { author: { select: { email: true } } },
  })

  if (!news) {
    redirect("/admin/news")
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
          <p className="text-gray-600 mt-2">Update news article</p>
        </div>

        <NewsForm news={news} />
      </div>
    </AdminLayout>
  )
}

