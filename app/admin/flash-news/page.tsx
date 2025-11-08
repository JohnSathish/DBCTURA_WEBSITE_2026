import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DeleteFlashNewsButton } from "@/components/admin/flash-news/DeleteFlashNewsButton"

export default async function FlashNewsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  let flashNewsList: any[] = []
  try {
    // Check if flashNews model exists in Prisma client
    if (!(prisma as any).flashNews) {
      console.warn("FlashNews model not found in Prisma client. Please run 'npx prisma generate'")
      flashNewsList = []
    } else {
      flashNewsList = await prisma.flashNews.findMany({
        orderBy: [
          { displayOrder: "asc" },
          { createdAt: "desc" },
        ],
      })
    }
  } catch (error: any) {
    console.error("Error fetching flash news:", error)
    flashNewsList = []
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Flash News</h1>
            <p className="text-gray-600 mt-2">Manage flash news items displayed on the homepage</p>
          </div>
          <Link href="/admin/flash-news/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Flash News
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Flash News Items ({flashNewsList.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {flashNewsList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No flash news items yet. Create your first one!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flashNewsList.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell className="max-w-md">
                        <p className="truncate text-sm text-gray-600">
                          {item.description || "—"}
                        </p>
                      </TableCell>
                      <TableCell>
                        {item.file ? (
                          <span className="text-sm text-blue-600">
                            {item.fileType === "pdf" ? "PDF" : "Image"}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">No file</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.published
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.published ? "Published" : "Draft"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/admin/flash-news/${item.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <DeleteFlashNewsButton flashNewsId={item.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

