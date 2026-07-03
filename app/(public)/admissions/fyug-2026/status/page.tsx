"use client"

import { useState } from "react"
import BreadcrumbTitleSetter from "@/components/layout/BreadcrumbTitleSetter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function FyugStatusPage() {
  const [applicationNo, setApplicationNo] = useState("")
  const [mobile, setMobile] = useState("")
  const [result, setResult] = useState<{
    id?: string
    fullName?: string
    honoursSubject?: string
    status?: string
    eligible?: boolean
    pdfUrl?: string | null
  } | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function lookup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const res = await fetch(
        `/api/fyug-admissions/status?applicationNo=${encodeURIComponent(applicationNo)}&mobile=${encodeURIComponent(mobile)}`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Not found")
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lookup failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <BreadcrumbTitleSetter title="Track FYUG Application" />
      <div className="max-w-md mx-auto rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-brand-text">Track Application Status</h1>
        <form onSubmit={lookup} className="mt-6 space-y-4">
          <div>
            <Label>Application Number</Label>
            <Input value={applicationNo} onChange={(e) => setApplicationNo(e.target.value)} required />
          </div>
          <div>
            <Label>Mobile Number</Label>
            <Input
              inputMode="numeric"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Checking…" : "Check Status"}
          </Button>
        </form>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {result && (
          <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm space-y-2">
            <p><strong>Name:</strong> {String(result.fullName)}</p>
            <p><strong>Honours:</strong> {String(result.honoursSubject)}</p>
            <p><strong>Status:</strong> {String(result.status)}</p>
            <p><strong>Eligible:</strong> {result.eligible ? "Yes" : "No"}</p>
            {result.pdfUrl && result.id && (
              <Button asChild size="sm" variant="outline" className="mt-2">
                <a
                  href={`/api/fyug-admissions/${result.id}/pdf?applicationNo=${encodeURIComponent(applicationNo)}&mobile=${encodeURIComponent(mobile)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download PDF
                </a>
              </Button>
            )}
          </div>
        )}
        <p className="mt-6 text-center text-sm">
          <Link href="/admissions/fyug-2026" className="text-brand-navy underline">
            Back to registration
          </Link>
        </p>
      </div>
    </div>
  )
}
