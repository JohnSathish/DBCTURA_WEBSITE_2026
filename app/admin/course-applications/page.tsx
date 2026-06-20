import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { COURSE_CATALOG } from "@/lib/courseCatalog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CheckCircle2, XCircle, Download, Filter } from "lucide-react"

async function getCounts() {
  const [total, pending, approved, rejected] = await Promise.all([
    prisma.courseApplication.count(),
    prisma.courseApplication.count({ where: { status: "Pending" } }),
    prisma.courseApplication.count({ where: { status: "Approved" } }),
    prisma.courseApplication.count({ where: { status: "Rejected" } }),
  ])
  return { total, pending, approved, rejected }
}

export default async function CourseApplicationsAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  const sp = await searchParams
  const course = String(sp.course || "").trim().toUpperCase()
  const status = String(sp.status || "").trim()
  const batchNo = String(sp.batchNo || "").trim()
  const batchYear = String(sp.batchYear || "").trim()

  const qs = new URLSearchParams()
  if (course) qs.set("course", course)
  if (status) qs.set("status", status)
  if (batchNo) qs.set("batchNo", batchNo)
  if (batchYear) qs.set("batchYear", batchYear)

  function makeHref(overrides: Partial<Record<"course" | "status" | "batchNo" | "batchYear", string | null>>) {
    const p = new URLSearchParams(qs)
    for (const [k, v] of Object.entries(overrides)) {
      if (!v) p.delete(k)
      else p.set(k, v)
    }
    const s = p.toString()
    return s ? `/admin/course-applications?${s}` : "/admin/course-applications"
  }

  const where: any = {}
  if (course) where.courseCode = course
  if (status) where.status = status
  if (batchNo) where.batchNo = Number(batchNo)
  if (batchYear) where.batchYear = Number(batchYear)

  const [counts, rows, batchCounts] = await Promise.all([
    getCounts(),
    prisma.courseApplication.findMany({ where, orderBy: [{ createdAt: "desc" }] }),
    prisma.courseApplication.groupBy({
      by: ["batchNo"],
      _count: { _all: true },
      where: course ? { courseCode: course, ...(batchYear ? { batchYear: Number(batchYear) } : {}) } : (batchYear ? { batchYear: Number(batchYear) } : {}),
    }),
  ])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Course Applications
            </h1>
            <p className="mt-1 text-slate-600">
              Manage short-term course enquiries and applications.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/api/course-applications?${qs.toString()}`}>
              <Button variant="outline" className="rounded-xl">
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
            </Link>
            <Link href={`/admin/course-applications/export.csv?${qs.toString()}`}>
              <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Card className="rounded-2xl border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Total</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-slate-900">{counts.total}</CardContent>
          </Card>
          <Card className="rounded-2xl border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Pending</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-slate-900">{counts.pending}</CardContent>
          </Card>
          <Card className="rounded-2xl border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Approved</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-slate-900">{counts.approved}</CardContent>
          </Card>
          <Card className="rounded-2xl border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Rejected</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-slate-900">{counts.rejected}</CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link href={makeHref({ course: null, status: null, batchNo: null, batchYear: null })}>
              <Button
                variant={!course && !status && !batchNo && !batchYear ? "default" : "outline"}
                className="rounded-xl"
              >
                All
              </Button>
            </Link>
            {(Object.keys(COURSE_CATALOG) as Array<keyof typeof COURSE_CATALOG>).map((c) => (
              <Link key={c} href={makeHref({ course: c })}>
                <Button variant={course === c ? "default" : "outline"} className="rounded-xl">
                  {c}
                </Button>
              </Link>
            ))}
            {(["Pending", "Approved", "Rejected"] as const).map((s) => (
              <Link key={s} href={makeHref({ status: s })}>
                <Button variant={status === s ? "default" : "outline"} className="rounded-xl">
                  {s}
                </Button>
              </Link>
            ))}
            {(["1", "2", "3"] as const).map((b) => (
              <Link key={b} href={makeHref({ batchNo: b })}>
                <Button variant={batchNo === b ? "default" : "outline"} className="rounded-xl">
                  Batch {b}
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle>Batch-wise counts {course ? `(${course})` : ""}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {(["1", "2", "3"] as const).map((b) => {
              const n = batchCounts.find((x) => String(x.batchNo) === b)?._count?._all ?? 0
              return (
                <Badge key={b} className="bg-slate-50 text-slate-700 border-slate-200">
                  Batch {b}: {n}
                </Badge>
              )
            })}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle>Applications ({rows.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <Table>
                <TableHeader className="bg-slate-50/70">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      App No
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Name
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Course
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Batch
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Mobile
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Status
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Created
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id} className="hover:bg-slate-50/60">
                      <TableCell className="px-4 py-4 text-slate-700 font-semibold">{r.applicationNo}</TableCell>
                      <TableCell className="px-4 py-4 text-slate-900 font-semibold">{r.studentName}</TableCell>
                      <TableCell className="px-4 py-4 text-slate-700">
                        <div className="font-semibold">{r.courseCode}</div>
                        <div className="text-xs text-slate-500">{r.courseName}</div>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-slate-700">
                        {r.batchYear || new Date(r.createdAt).getFullYear()} / Batch {r.batchNo}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-slate-700">{r.mobile}</TableCell>
                      <TableCell className="px-4 py-4">
                        <Badge
                          className={
                            r.status === "Approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : r.status === "Rejected"
                                ? "bg-red-50 text-red-700 border-red-100"
                                : "bg-slate-50 text-slate-700 border-slate-200"
                          }
                        >
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-slate-700">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <form action={`/admin/course-applications/${r.id}/approve`} method="post">
                            <Button variant="outline" className="rounded-xl h-9 px-3">
                              <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600" />
                              Approve
                            </Button>
                          </form>
                          <form action={`/admin/course-applications/${r.id}/reject`} method="post">
                            <Button variant="outline" className="rounded-xl h-9 px-3">
                              <XCircle className="h-4 w-4 mr-2 text-red-600" />
                              Reject
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="px-4 py-10 text-center text-slate-500">
                        No applications found.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

