"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

type AuditEntry = {
  id: string
  action: string
  adminEmail: string | null
  details: string | null
  createdAt: string
}

type AppDetail = {
  id: string
  applicationNo: string | null
  fullName: string | null
  gender: string | null
  dob: string | null
  mobile: string | null
  email: string | null
  state: string | null
  photoUrl: string | null
  fatherName: string | null
  fatherMobile: string | null
  motherName: string | null
  motherMobile: string | null
  collegeName: string | null
  affiliatedUniversity: string | null
  majorSubject: string | null
  minorSubject: string | null
  honoursSubject: string | null
  cuetScore: number | null
  cgpa: number | null
  percentage: number | null
  hasBackPaper: boolean
  eligible: boolean
  status: string
  remarks: string | null
  pdfUrl: string | null
  auditLogs?: AuditEntry[]
}

export default function FyugAdmissionDetail({ id }: { id: string }) {
  const router = useRouter()
  const [app, setApp] = useState<AppDetail | null>(null)
  const [remarks, setRemarks] = useState("")
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/fyug-admissions/${id}`)
      const data = await res.json()
      setApp(data)
      setRemarks(String(data.remarks || ""))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function approve() {
    setActing(true)
    try {
      await fetch(`/api/fyug-admissions/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remarks }),
      })
      await load()
      router.refresh()
    } finally {
      setActing(false)
    }
  }

  async function reject() {
    setActing(true)
    try {
      await fetch(`/api/fyug-admissions/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remarks }),
      })
      await load()
      router.refresh()
    } finally {
      setActing(false)
    }
  }

  async function regeneratePdf() {
    setActing(true)
    try {
      await fetch(`/api/fyug-admissions/${id}/regenerate-pdf`, { method: "POST" })
      await load()
    } finally {
      setActing(false)
    }
  }

  if (loading || !app) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const field = (label: string, value: string | number | boolean | null | undefined) => (
    <div className="grid grid-cols-3 gap-2 py-1 text-sm border-b border-slate-100">
      <span className="text-slate-500">{label}</span>
      <span className="col-span-2 font-medium">{String(value ?? "—")}</span>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/fyug-admissions" className="text-sm text-blue-600 underline">
            ← Back to list
          </Link>
          <h1 className="text-2xl font-bold mt-1">{app.applicationNo}</h1>
          <p className="text-slate-600">{String(app.fullName)} · {String(app.status)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {app.pdfUrl && (
            <Button asChild variant="outline" size="sm">
              <a href={`/api/fyug-admissions/${id}/pdf`} target="_blank" rel="noopener noreferrer">
                Download PDF
              </a>
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={regeneratePdf} disabled={acting}>
            Regenerate PDF
          </Button>
          <Button size="sm" onClick={approve} disabled={acting}>
            Approve
          </Button>
          <Button size="sm" variant="destructive" onClick={reject} disabled={acting}>
            Reject
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
          </CardHeader>
          <CardContent>
            {app.photoUrl && (
              <img
                src={String(app.photoUrl)}
                alt="Applicant"
                className="h-24 w-24 object-cover rounded border mb-4"
              />
            )}
            {field("Gender", app.gender)}
            {field("Date of Birth", app.dob)}
            {field("Mobile", app.mobile)}
            {field("Email", app.email)}
            {field("State", app.state)}
            {field("Father", app.fatherName)}
            {field("Father Mobile", app.fatherMobile)}
            {field("Mother", app.motherName)}
            {field("Mother Mobile", app.motherMobile)}
            {field("College", app.collegeName)}
            {field("University", app.affiliatedUniversity)}
            {field("Major", app.majorSubject)}
            {field("Minor", app.minorSubject)}
            {field("Honours", app.honoursSubject)}
            {field("CUET Score", app.cuetScore)}
            {field("CGPA", app.cgpa)}
            {field("Percentage", app.percentage)}
            {field("Back Papers", app.hasBackPaper ? "Yes" : "No")}
            {field("Eligible", app.eligible ? "Yes" : "No")}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Remarks</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={4} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit Log</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2 max-h-64 overflow-y-auto">
              {(app.auditLogs || []).length === 0 ? (
                <p className="text-slate-500">No actions yet.</p>
              ) : (
                app.auditLogs!.map((log) => (
                  <div key={log.id} className="border-b pb-2">
                    <p className="font-medium">{log.action}</p>
                    <p className="text-slate-500">
                      {log.adminEmail || "System"} · {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
