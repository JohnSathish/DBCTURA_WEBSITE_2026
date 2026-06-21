import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import FlashNewsList from "@/components/admin/flash-news/FlashNewsList"

export default async function FlashNewsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  let flashNewsList: Awaited<ReturnType<typeof prisma.flashNews.findMany>> = []
  try {
    if (!(prisma as { flashNews?: typeof prisma.flashNews }).flashNews) {
      console.warn("FlashNews model not found in Prisma client. Please run 'npx prisma generate'")
    } else {
      flashNewsList = await prisma.flashNews.findMany({
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      })
    }
  } catch (error) {
    console.error("Error fetching flash news:", error)
  }

  return (
    <AdminLayout>
      <div className="admin-page space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Flash News</h1>
            <p className="mt-1.5 text-sm text-slate-600 sm:text-base">
              Manage flash news items displayed on the homepage ticker.
            </p>
          </div>
          <Link href="/admin/flash-news/new" className="shrink-0">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add New Flash News
            </Button>
          </Link>
        </div>

        <Card className="overflow-hidden border-slate-200 shadow-sm shadow-slate-900/5">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <CardTitle className="text-base font-semibold text-slate-900">
              Flash News Items ({flashNewsList.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="min-w-0 p-4 sm:p-6">
            <FlashNewsList items={flashNewsList} />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
