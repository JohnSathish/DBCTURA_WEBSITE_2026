"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, ImageIcon, Loader2 } from "lucide-react"

export type AlumniRow = {
  id: string
  createdAt: string
  fullName: string
  email: string
  mobileNumber: string
  department: string
  courseProgram: string
  yearOfGraduation: number
  profilePhoto: string | null
}

export default function AlumniRegistrationsManager({ initialRows }: { initialRows: AlumniRow[] }) {
  const [exporting, setExporting] = useState(false)

  async function downloadExport() {
    setExporting(true)
    try {
      const res = await fetch("/api/alumni/registrations/export", { credentials: "same-origin" })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || "Export failed")
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `alumni-registrations-${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      alert(e?.message || "Could not download export")
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alumni registrations</h1>
          <p className="text-gray-600 mt-2">
            Submissions from the public alumni form. Download all fields as Excel (.xlsx).
          </p>
        </div>
        <Button type="button" onClick={downloadExport} disabled={exporting} className="shrink-0">
          <span className="inline-flex items-center gap-2">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
            <span>{exporting ? "Preparing…" : "Download Excel"}</span>
          </span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent submissions ({initialRows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {initialRows.length === 0 ? (
            <p className="text-gray-500 py-8 text-center">No registrations yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[72px]">Photo</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Graduation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialRows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="align-middle">
                        {r.profilePhoto ? (
                          <a
                            href={r.profilePhoto}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block rounded-md ring-1 ring-slate-200/80 overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                            title="Open full size"
                          >
                            <img
                              src={r.profilePhoto}
                              alt={`${r.fullName} profile`}
                              width={48}
                              height={48}
                              className="h-12 w-12 object-cover"
                              loading="lazy"
                            />
                          </a>
                        ) : (
                          <span
                            className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 text-slate-400"
                            title="No photo uploaded"
                          >
                            <ImageIcon className="h-5 w-5" aria-hidden />
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-slate-600">
                        {r.createdAt.slice(0, 10)}
                      </TableCell>
                      <TableCell className="font-medium">{r.fullName}</TableCell>
                      <TableCell className="text-sm">{r.email}</TableCell>
                      <TableCell className="text-sm">{r.mobileNumber}</TableCell>
                      <TableCell className="text-sm">{r.courseProgram}</TableCell>
                      <TableCell className="text-sm">{r.department}</TableCell>
                      <TableCell className="text-sm">{r.yearOfGraduation}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
