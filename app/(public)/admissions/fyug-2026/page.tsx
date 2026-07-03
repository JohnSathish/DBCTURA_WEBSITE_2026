import { Suspense } from "react"
import BreadcrumbTitleSetter from "@/components/layout/BreadcrumbTitleSetter"
import FyugAdmissionForm from "@/components/fyug-admission/FyugAdmissionForm"
import { getFyugAdmissionSettings } from "@/lib/fyug-settings"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

function FormLoader() {
  return (
    <div className="flex justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
    </div>
  )
}

export default async function FyugAdmissionPage() {
  const settings = await getFyugAdmissionSettings()

  if (!settings.open) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-16 px-4">
        <BreadcrumbTitleSetter title="FYUG Honours Registration" />
        <div className="mx-auto max-w-2xl rounded-[18px] border border-[#DCE3EC] bg-white p-10 text-center shadow-lg">
          <h1 className="font-heading text-2xl font-bold text-[#0F4C81]">Registration Closed</h1>
          <p className="mt-4 text-slate-600">{settings.closedMessage}</p>
          <Button asChild className="mt-6">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <BreadcrumbTitleSetter title="FYUG Honours Registration 2026–27" />
      <Suspense fallback={<FormLoader />}>
        <FyugAdmissionForm />
      </Suspense>
    </div>
  )
}
