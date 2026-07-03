"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import BreadcrumbTitleSetter from "@/components/layout/BreadcrumbTitleSetter"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const applicationNo = searchParams.get("no") || ""
  const id = searchParams.get("id") || ""

  const pdfHref = id
    ? `/api/fyug-admissions/${id}/pdf?applicationNo=${encodeURIComponent(applicationNo)}&mobile=`
    : "#"

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-slate-50 py-12 px-4">
      <BreadcrumbTitleSetter title="Registration Successful" />
      <div className="max-w-lg mx-auto rounded-2xl border bg-white p-8 shadow-lg text-center">
        <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
        <h1 className="mt-4 text-2xl font-bold text-brand-text">Registration Successful</h1>
        <p className="mt-2 text-slate-600">Your application has been submitted.</p>
        <p className="mt-4 text-lg">
          Application No: <strong className="text-brand-navy">{applicationNo}</strong>
        </p>
        <p className="mt-2 text-sm text-slate-500">
          A confirmation email with your PDF has been sent to your registered email address.
        </p>
        {id && applicationNo && (
          <p className="mt-4 text-sm text-slate-600">
            To download your PDF, use the link in your email or visit{" "}
            <Link href="/admissions/fyug-2026/status" className="underline text-brand-navy">
              Track Status
            </Link>{" "}
            with your application number and mobile.
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3">
          <Button asChild variant="outline">
            <Link href="/admissions/fyug-2026/status">Track Status</Link>
          </Button>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function FyugSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
