"use client"

import { GraduationCap, Users, School, Award, Sparkles } from "lucide-react"

const STATS = [
  { icon: Users, value: "1000+", label: "Happy Students" },
  { icon: GraduationCap, value: "25+", label: "Courses Offered" },
  { icon: School, value: "40+", label: "Experienced Faculty" },
  { icon: Sparkles, value: "20+", label: "Clubs & Associations" },
  { icon: Award, value: "B Grade", label: "NAAC Accredited" },
] as const

export default function HomeStatsBar() {
  return (
    <section aria-label="College highlights" className="relative z-10 mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-gradient-to-r from-[#0c2340] via-[#1E3A8A] to-[#1e40af] px-4 py-5 shadow-xl shadow-[#1e3a8a]/25 ring-1 ring-white/10 sm:px-6 md:py-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-2">
          {STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:gap-3 sm:text-left lg:flex-col lg:items-center lg:text-center lg:gap-2"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-amber-300 ring-1 ring-white/15">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </div>
                <div>
                  <p className="font-heading text-lg font-bold leading-none text-white md:text-xl">{stat.value}</p>
                  <p className="mt-1 text-[11px] font-medium text-white/75 sm:text-xs">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
