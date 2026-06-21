import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { adminCellActions, adminCellWrap } from "@/components/admin/admin-table-classes"

export default async function DownloadsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const downloads = await prisma.download.findMany({
    orderBy: { uploadedAt: "desc" },
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Downloads</h1>
            <p className="text-gray-600 mt-2">Manage downloadable files</p>
          </div>
          <Link href="/admin/downloads/new">
            <Button>Add Download</Button>
          </Link>
        </div>

        {downloads.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No downloads yet. Add your first file!
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[45%]">Title</TableHead>
                  <TableHead className="whitespace-nowrap">Category</TableHead>
                  <TableHead className="whitespace-nowrap">Uploaded</TableHead>
                  <TableHead className={adminCellActions}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {downloads.map((download) => (
                  <TableRow key={download.id}>
                    <TableCell className={`font-medium ${adminCellWrap}`}>
                      <span className="line-clamp-3" title={download.title}>
                        {download.title}
                      </span>
                    </TableCell>
                    <TableCell>{download.category || "-"}</TableCell>
                    <TableCell>
                      {new Date(download.uploadedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className={adminCellActions}>
                      <Link href={`/admin/downloads/${download.id}`}>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

