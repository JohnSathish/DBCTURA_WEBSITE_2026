import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Calendar, FileText, ImageIcon, Type, Pin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DeleteNoticeButton } from "@/components/admin/notice-board/DeleteNoticeButton"

function typeIcon(type: string) {
  if (type === "document") return FileText
  if (type === "image") return ImageIcon
  return Type
}

function isNew(publishDate: Date) {
  const now = Date.now()
  const diff = now - new Date(publishDate).getTime()
  return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000
}

export default async function NoticeBoardNoticesAdminPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  const notices = await prisma.noticeBoardNotice.findMany({
    orderBy: [
      { pinned: "desc" },
      { important: "desc" },
      { publishDate: "desc" },
      { createdAt: "desc" },
    ],
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Notice Board
            </h1>
            <p className="mt-1 text-sm sm:text-base text-slate-600">
              Manage notices shown to students (PDF / Image / Text)
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/notice-board">
              <Button variant="outline" className="rounded-xl">
                <Calendar className="h-4 w-4 mr-2" />
                Events
              </Button>
            </Link>
            <Link href="/admin/notice-board/notices/new">
              <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20">
                <Plus className="h-4 w-4 mr-2" />
                Add Notice
              </Button>
            </Link>
          </div>
        </div>

        <Card className="rounded-2xl border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between gap-3">
              <span>Notices ({notices.length})</span>
              <Link
                href="/notice-board"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                target="_blank"
                rel="noreferrer"
              >
                View student page →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notices.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                No notices yet. Create your first notice!
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <Table>
                  <TableHeader className="bg-slate-50/70">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Notice
                      </TableHead>
                      <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Type
                      </TableHead>
                      <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Publish
                      </TableHead>
                      <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Downloads
                      </TableHead>
                      <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Status
                      </TableHead>
                      <TableHead className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notices.map((n) => {
                      const Icon = typeIcon(n.noticeType)
                      const pub = new Date(n.publishDate)
                      const exp = n.expiryDate ? new Date(n.expiryDate) : null
                      return (
                        <TableRow key={n.id} className="hover:bg-slate-50/60">
                          <TableCell className="px-4 py-4">
                            <div className="flex items-start gap-3">
                              <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white">
                                <Icon className="h-4.5 w-4.5 text-slate-700" />
                              </span>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="font-semibold text-slate-900 truncate">
                                    {n.title}
                                  </div>
                                  {n.pinned ? (
                                    <Badge className="bg-blue-50 text-blue-700 border-blue-100">
                                      <Pin className="h-3.5 w-3.5 mr-1" /> Pinned
                                    </Badge>
                                  ) : null}
                                  {n.important ? (
                                    <Badge className="bg-red-50 text-red-700 border-red-100">
                                      Important
                                    </Badge>
                                  ) : null}
                                  {isNew(pub) ? (
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">
                                      New
                                    </Badge>
                                  ) : null}
                                </div>
                                <div className="mt-1 text-xs text-slate-500">
                                  {exp ? `Expires ${exp.toLocaleDateString()}` : "No expiry"}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4 text-slate-700">
                            {n.noticeType}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-slate-700">
                            {pub.toLocaleDateString()}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-slate-700">
                            {n.noticeType === "document" ? n.downloadCount.toLocaleString() : "—"}
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                                n.active
                                  ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                                  : "bg-slate-50 text-slate-700 ring-slate-200"
                              }`}
                            >
                              {n.active ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <div className="flex justify-end gap-2">
                              <Link href={`/admin/notice-board/notices/${n.id}`}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-xl hover:bg-slate-100"
                                  aria-label={`Edit ${n.title}`}
                                >
                                  ✎
                                </Button>
                              </Link>
                              <DeleteNoticeButton noticeId={n.id} />
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

