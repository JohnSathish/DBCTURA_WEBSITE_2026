"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import BreadcrumbTitleSetter from "@/components/layout/BreadcrumbTitleSetter"
import Link from "next/link"

function VerifyContent() {
  const searchParams = useSearchParams()
  const no = searchParams.get("no") || ""
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!no) return
    fetch(`/api/fyug-admissions/verify?no=${encodeURIComponent(no)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.verified) setData(d.application)
        else setError(d.error || "Not found")
      })
      .catch(() => setError("Verification failed"))
  }, [no])

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <BreadcrumbTitleSetter title="Verify Application" />
      <div className="max-w-md mx-auto rounded-2xl border bg-white p-6 shadow-sm text-center">
        <h1 className="text-xl font-bold">Application Verification</h1>
        {error && <p className="mt-4 text-red-600">{error}</p>}
        {data && (
          <div className="mt-4 text-left text-sm space-y-2">
            <p className="text-green-700 font-semibold text-center">✓ Valid application on file</p>
            <p><strong>No:</strong> {String(data.applicationNo)}</p>
            <p><strong>Name:</strong> {String(data.fullName)}</p>
            <p><strong>Honours:</strong> {String(data.honoursSubject)}</p>
            <p><strong>Session:</strong> {String(data.academicSession)}</p>
            <p><strong>Status:</strong> {String(data.status)}</p>
          </div>
        )}
        <Link href="/" className="inline-block mt-6 text-sm text-brand-navy underline">
          Home
        </Link>
      </div>
    </div>
  )
}

export default function FyugVerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  )
}
