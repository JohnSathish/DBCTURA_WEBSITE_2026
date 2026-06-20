import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Newspaper, Image, Download } from "lucide-react"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const [pagesCount, newsCount, galleryCount, downloadsCount] = await Promise.all([
    prisma.page.count(),
    prisma.news.count(),
    prisma.galleryImage.count(),
    prisma.download.count(),
  ])

  const stats = [
    { label: "Pages", value: pagesCount, icon: FileText, color: "bg-brand-navy", iconClass: "text-white" },
    { label: "News", value: newsCount, icon: Newspaper, color: "bg-brand-gold", iconClass: "text-brand-text" },
    { label: "Gallery Images", value: galleryCount, icon: Image, color: "bg-brand-navy", iconClass: "text-white" },
    { label: "Downloads", value: downloadsCount, icon: Download, color: "bg-brand-green", iconClass: "text-white" },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {session.user?.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </CardTitle>
                  <div className={`${stat.color} p-2 rounded-lg`}>
                    <Icon className={`h-4 w-4 ${stat.iconClass}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="/admin/pages/new"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">Create New Page</div>
                <div className="text-sm text-gray-500">Add a new page</div>
              </a>
              <a
                href="/admin/news/new"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">Create News Article</div>
                <div className="text-sm text-gray-500">Publish news</div>
              </a>
              <a
                href="/admin/gallery"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">Manage Gallery</div>
                <div className="text-sm text-gray-500">Upload images</div>
              </a>
              <a
                href="/admin/downloads"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">Add Download</div>
                <div className="text-sm text-gray-500">Upload files</div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

