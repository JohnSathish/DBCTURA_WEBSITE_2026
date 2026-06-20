"use client"

import { GraduationCap, Building2, HeartHandshake, UsersRound } from "lucide-react"

const FEATURES = [
  {
    icon: GraduationCap,
    title: "Quality Education",
    description: "Industry-oriented curriculum with experienced faculty and academic excellence.",
    accent: "from-[#1E3A8A] to-[#2563EB]",
  },
  {
    icon: Building2,
    title: "Modern Campus",
    description: "Smart classrooms, labs, library, and facilities for a vibrant learning environment.",
    accent: "from-[#0f766e] to-[#14b8a6]",
  },
  {
    icon: UsersRound,
    title: "Holistic Growth",
    description: "Sports, clubs, culture, and leadership opportunities beyond the classroom.",
    accent: "from-[#7c3aed] to-[#a78bfa]",
  },
  {
    icon: HeartHandshake,
    title: "Student Support",
    description: "Guidance, mentorship, counselling, and services for every stage of your journey.",
    accent: "from-[#b45309] to-[#f59e0b]",
  },
] as const

export default function HomeFeatureCards() {
  return (
    <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 md:-mt-20 pb-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {FEATURES.map((item) => {
          const Icon = item.icon
          return (
            <article
              key={item.title}
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.18)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-12px_rgba(30,58,138,0.22)]"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.accent} text-white shadow-lg transition group-hover:scale-105`}
              >
                <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="font-heading text-base font-bold text-slate-900 md:text-lg">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
            </article>
          )
        })}
      </div>
    </div>
  )
}
