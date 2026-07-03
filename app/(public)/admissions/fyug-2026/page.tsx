import { Suspense } from "react"
import Image from "next/image"
import BreadcrumbTitleSetter from "@/components/layout/BreadcrumbTitleSetter"
import FyugAdmissionForm from "@/components/fyug-admission/FyugAdmissionForm"
import { getFyugAdmissionSettings } from "@/lib/fyug-settings"
import { FYUG_ACADEMIC_SESSION } from "@/lib/fyug-admission-constants"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

function FormLoader() {
  return (
    <div className="flex justify-center py-20">
      <p className="text-slate-500">Loading registration form…</p>
    </div>
  )
}

export default async function FyugAdmissionPage() {
  const settings = await getFyugAdmissionSettings()

  if (!settings.open) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-10 px-4">
        <BreadcrumbTitleSetter title="FYUG Honours Registration" />
        <div className="mx-auto max-w-2xl text-center rounded-2xl border bg-white p-10 shadow-sm">
          <h1 className="text-2xl font-bold text-brand-text">Registration Closed</h1>
          <p className="mt-4 text-slate-600">{settings.closedMessage}</p>
          <Button asChild className="mt-6">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 py-8 px-4">
      <BreadcrumbTitleSetter title="FYUG Honours Registration 2026–27" />

      <div className="max-w-4xl mx-auto mb-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <Image src="/logo.png" alt="Don Bosco College" width={72} height={72} className="rounded-full" />
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-text font-heading">
            Don Bosco College, Tura
          </h1>
          <p className="text-sm text-slate-600">
            Affiliated to North Eastern Hill University (NEHU), Shillong · NAAC Accredited College
          </p>
          <p className="text-brand-gold font-semibold">Academic Session {FYUG_ACADEMIC_SESSION}</p>
          <h2 className="text-lg font-semibold text-slate-800 max-w-2xl">
            Registration for Fourth-Year Undergraduate Honours Programme (NEP 2020)
          </h2>
        </div>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-950">
          <p className="font-semibold mb-1">Eligibility Notice</p>
          <p>
            Students who are bona fide students of any college affiliated with North Eastern Hill University
            (NEHU), Shillong, including Don Bosco College, Tura, and are currently pursuing the Four-Year
            Undergraduate Programme (FYUP) under NEP 2020 are invited to register their interest for admission
            to the Fourth-Year Undergraduate Honours Programme at Don Bosco College, Tura.
          </p>
          <p className="mt-2 font-medium">
            Applicants must have successfully completed Semester V without any back papers.
          </p>
        </div>

        <p className="mt-4 text-sm">
          <Link href="/admissions/fyug-2026/status" className="text-brand-navy underline">
            Track application status
          </Link>
        </p>
      </div>

      <Suspense fallback={<FormLoader />}>
        <FyugAdmissionForm />
      </Suspense>
    </div>
  )
}
