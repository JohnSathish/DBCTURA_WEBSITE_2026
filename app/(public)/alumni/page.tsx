import Link from "next/link"
import BreadcrumbTitleSetter from "@/components/layout/BreadcrumbTitleSetter"
import AlumniRegistrationForm from "@/components/alumni/AlumniRegistrationForm"

export const metadata = {
  title: "Alumni | Don Bosco College, Tura",
  description: "Alumni registration — stay connected with Don Bosco College, Tura.",
}

export default function AlumniPage() {
  return (
    <div className="bg-brand-surface min-h-screen py-10 px-4 sm:px-6">
      <BreadcrumbTitleSetter title="Alumni" />
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-maroon">Don Bosco College, Tura</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-brand-text md:text-4xl">Alumni</h1>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Register below to join our alumni network. Your details help us stay in touch and share opportunities,
            events, and ways to give back.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-semibold text-[#1E3A8A] hover:underline"
          >
            ← Back to home
          </Link>
        </div>

        <AlumniRegistrationForm />
      </div>
    </div>
  )
}
