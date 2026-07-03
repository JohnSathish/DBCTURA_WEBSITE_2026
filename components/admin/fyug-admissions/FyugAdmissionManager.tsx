"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import {
  FYUG_HONOURS_SUBJECTS,
  FYUG_STATUSES,
} from "@/lib/fyug-admission-constants"
import { Download, Eye, Loader2, RefreshCw } from "lucide-react"

type AppRow = {
  id: string
  applicationNo: string | null
  fullName: string | null
  mobile: string | null
  gender: string | null
  collegeName: string | null
  majorSubject: string | null
  minorSubject: string | null
  honoursSubject: string | null
  cuetScore: number | null
  eligible: boolean
  status: string
  submittedAt: string | null
}

type Stats = {
  total: number
  submittedToday: number
  eligible: number
  rejected: number
  pending: number
  byHonours: { name: string; count: number }[]
  byCollege: { name: string; count: number }[]
  byState: { name: string; count: number }[]
  byGender: { name: string; count: number }[]
}

export default function FyugAdmissionManager() {
  const [apps, setApps] = useState<AppRow[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("")
  const [honours, setHonours] = useState("")
  const [portalOpen, setPortalOpen] = useState(true)
  const [settingsLoading, setSettingsLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set("q", q)
      if (status) params.set("status", status)
      if (honours) params.set("honours", honours)
      const res = await fetch(`/api/fyug-admissions/list?${params}`)
      const data = await res.json()
      setApps(data.applications || [])
      setStats(data.stats || null)
    } finally {
      setLoading(false)
    }
  }, [q, status, honours])

  const loadSettings = useCallback(async () => {
    const res = await fetch("/api/fyug-admissions/settings")
    const data = await res.json()
    setPortalOpen(data.open !== false)
  }, [])

  useEffect(() => {
    load()
    loadSettings()
  }, [load, loadSettings])

  async function togglePortal(open: boolean) {
    setSettingsLoading(true)
    try {
      await fetch("/api/fyug-admissions/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ open }),
      })
      setPortalOpen(open)
    } finally {
      setSettingsLoading(false)
    }
  }

  async function exportData(format: "xlsx" | "csv") {
    setExporting(true)
    try {
      const params = new URLSearchParams({ format })
      if (status) params.set("status", status)
      if (honours) params.set("honours", honours)
      const res = await fetch(`/api/fyug-admissions/export?${params}`)
      if (!res.ok) throw new Error("Export failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `fyug-admissions.${format === "csv" ? "csv" : "xlsx"}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Export failed")
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">FYUG Honours Admissions</h1>
          <p className="text-gray-600 mt-1">
            Fourth-Year UG Honours registrations — Academic Session 2026–2027
          </p>
          <Link
            href="/admissions/fyug-2026"
            target="_blank"
            className="text-sm text-blue-700 underline mt-1 inline-block"
          >
            Open public portal
          </Link>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2 bg-white">
            <Label htmlFor="portal-open" className="text-sm whitespace-nowrap">
              Registration open
            </Label>
            <Switch
              id="portal-open"
              checked={portalOpen}
              disabled={settingsLoading}
              onCheckedChange={togglePortal}
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => load()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => exportData("xlsx")} disabled={exporting}>
            <Download className="h-4 w-4 mr-1" />
            Excel
          </Button>
          <Button size="sm" variant="secondary" onClick={() => exportData("csv")} disabled={exporting}>
            CSV
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            ["Total", stats.total],
            ["Today", stats.submittedToday],
            ["Eligible", stats.eligible],
            ["Rejected", stats.rejected],
            ["Pending", stats.pending],
          ].map(([label, val]) => (
            <Card key={String(label)}>
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-2xl font-bold">{val}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {stats && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ["Honours-wise", stats.byHonours],
            ["College-wise", stats.byCollege],
            ["State-wise", stats.byState],
            ["Gender-wise", stats.byGender],
          ].map(([title, items]) => (
            <Card key={String(title)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{title as string}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1 max-h-40 overflow-y-auto">
                {(items as { name: string; count: number }[]).slice(0, 8).map((i) => (
                  <div key={i.name} className="flex justify-between">
                    <span className="truncate pr-2">{i.name}</span>
                    <span className="font-medium">{i.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <div className="flex flex-wrap gap-3 mt-3">
            <Input
              placeholder="Search name, mobile, app no…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="max-w-xs"
            />
            <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {FYUG_STATUSES.filter((s) => s !== "DRAFT").map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={honours || "all"} onValueChange={(v) => setHonours(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Honours" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All honours</SelectItem>
                {FYUG_HONOURS_SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="secondary" size="sm" onClick={load}>
              Apply filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : apps.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No applications found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>App No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Honours</TableHead>
                    <TableHead>CUET</TableHead>
                    <TableHead>Eligible</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apps.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs">{a.applicationNo}</TableCell>
                      <TableCell>{a.fullName}</TableCell>
                      <TableCell>{a.mobile}</TableCell>
                      <TableCell className="max-w-[120px] truncate">{a.collegeName}</TableCell>
                      <TableCell>{a.honoursSubject}</TableCell>
                      <TableCell>{a.cuetScore ?? "—"}</TableCell>
                      <TableCell>{a.eligible ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        <span className="text-xs font-medium">{a.status}</span>
                      </TableCell>
                      <TableCell>
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/admin/fyug-admissions/${a.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
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
