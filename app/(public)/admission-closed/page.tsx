import Link from "next/link"
import BreadcrumbTitleSetter from "@/components/layout/BreadcrumbTitleSetter"
import { Button } from "@/components/ui/button"

export default function AdmissionClosedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1220] via-[#1e3a8a] to-[#2563eb] py-10 px-4">
      <BreadcrumbTitleSetter title="Admissions Closed" />

      <div className="mx-auto max-w-4xl">
        <div className="rounded-[28px] border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl shadow-black/30 overflow-hidden">
          <div className="px-6 py-8 sm:px-10 sm:py-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/80">
              Don Bosco College, Tura
            </p>
            <p className="mt-2 text-sm font-semibold text-amber-300">Pursuit of Excellence</p>

            <div className="mt-7 rounded-2xl border border-white/10 bg-white/10 px-5 py-6 sm:px-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-300">
                Admissions Closed
              </h1>
              <p className="mt-2 text-white/90 text-base sm:text-lg">
                Admissions for the Academic Year <span className="font-bold">2026–2027</span> are now closed.
              </p>
            </div>

            <p className="mt-6 text-white/85">
              Thank you for your interest. Please stay tuned for updates on the next admission cycle.
            </p>

            <div className="mt-8 space-y-3">
              <Button
                asChild
                size="lg"
                className="w-full rounded-xl bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300 shadow-lg shadow-amber-400/20"
              >
                <Link href="/">Go to Home</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full rounded-xl border-white/35 bg-white/10 text-white hover:bg-white/15"
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>

            <p className="mt-6 text-xs text-white/60">
              If you need help, email{" "}
              <a className="underline underline-offset-4 hover:text-white" href="mailto:principal@donboscocollege.ac.in">
                principal@donboscocollege.ac.in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

