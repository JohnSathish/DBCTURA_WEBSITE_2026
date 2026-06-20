import Link from "next/link"
import {
  LifebuoyIcon,
  ShieldCheckIcon,
  ScaleIcon,
  HeartIcon,
  BookOpenIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline"
import { ArrowRight } from "lucide-react"

const ITEMS = [
  {
    title: "Grievance Cell",
    description: "Fair, timely support for student concerns and feedback.",
    href: "/student-services/grievance-cell",
    Icon: LifebuoyIcon,
    ring: "ring-blue-100",
    iconBg: "bg-blue-100 text-blue-700",
  },
  {
    title: "Anti-Ragging",
    description: "A safe campus aligned with UGC norms and pastoral care.",
    href: "/anti-ragging-cell",
    Icon: ShieldCheckIcon,
    ring: "ring-emerald-100",
    iconBg: "bg-emerald-100 text-emerald-800",
  },
  {
    title: "Internal Complaints Committee",
    description: "Confidential processes that protect dignity and justice.",
    href: "/women-cell",
    Icon: ScaleIcon,
    ring: "ring-amber-100",
    iconBg: "bg-amber-100 text-amber-900",
  },
  {
    title: "Red Ribbon Club",
    description: "Health awareness and peer-led outreach programmes.",
    href: "/clubs/red-ribbon-club",
    Icon: HeartIcon,
    ring: "ring-red-100",
    iconBg: "bg-red-100 text-red-700",
  },
  {
    title: "NSS",
    description: "Service, leadership, and community engagement.",
    href: "/clubs/nss",
    Icon: BookOpenIcon,
    ring: "ring-sky-100",
    iconBg: "bg-sky-100 text-sky-800",
  },
  {
    title: "NCC",
    description: "Discipline, leadership, and structured training.",
    href: "/clubs/ncc",
    Icon: ShieldExclamationIcon,
    ring: "ring-emerald-100",
    iconBg: "bg-emerald-100 text-emerald-900",
  },
] as const

export default function HomeStudentSupport() {
  return (
    <section className="relative overflow-hidden py-14 md:py-16">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-[#F8FAFC]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-heading text-3xl font-bold text-slate-900 md:text-4xl">Student Support &amp; Activities</h2>
          <p className="mx-auto mt-2 max-w-2xl text-slate-600">
            Dedicated cells and clubs that nurture wellbeing, safety, and holistic growth.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map(({ title, description, href, Icon, ring, iconBg }) => (
            <Link
              key={title}
              href={href}
              className="group block rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
            >
              <div
                className={`h-full rounded-3xl border border-slate-200/90 bg-white/90 p-7 text-center shadow-lg shadow-slate-900/5 ring-1 ${ring} transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#1e3a8a]/10`}
              >
                <div
                  className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${iconBg} shadow-md shadow-slate-900/10 ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className="h-8 w-8 drop-shadow-[0_1px_0_rgba(255,255,255,0.35)]" aria-hidden />
                </div>
                <h3 className="font-heading text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
                <div className="mt-5 inline-flex items-center justify-center gap-1 text-sm font-semibold text-[#1E3A8A] transition-colors group-hover:text-amber-600">
                  Learn More
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
