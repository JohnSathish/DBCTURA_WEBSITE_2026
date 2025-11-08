import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import FlashNewsForm from "@/components/admin/flash-news/FlashNewsForm"

export default async function EditFlashNewsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const { id } = await params

  let flashNews: any = null
  try {
    if (!(prisma as any).flashNews) {
      console.warn("FlashNews model not found in Prisma client. Please run 'npx prisma generate'")
      redirect("/admin/flash-news")
    }
    flashNews = await prisma.flashNews.findUnique({
      where: { id },
    })
  } catch (error: any) {
    console.error("Error fetching flash news:", error)
    redirect("/admin/flash-news")
  }

  if (!flashNews) {
    redirect("/admin/flash-news")
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Flash News</h1>
          <p className="text-gray-600 mt-2">Update flash news details</p>
        </div>

        <FlashNewsForm flashNews={flashNews} />
      </div>
    </AdminLayout>
  )
}

