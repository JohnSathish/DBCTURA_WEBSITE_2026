import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import NewsList from "@/components/admin/news/NewsList"

export default async function NewsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const news = await prisma.news.findMany({
    orderBy: { updatedAt: "desc" },
    include: { author: { select: { email: true } } },
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">News</h1>
            <p className="text-gray-600 mt-2">Manage news articles</p>
          </div>
          <a
            href="/admin/news/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Article
          </a>
        </div>

        <NewsList initialNews={news} />
      </div>
    </AdminLayout>
  )
}

