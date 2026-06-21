"use client"

import { useEffect, useRef, useState } from "react"
import { GraduationCap, Users, School, Award } from "lucide-react"
import { cn } from "@/lib/utils"
const STATS = [
  {
    icon: GraduationCap,
    target: 25,
    suffix: "+",
    titleRest: " Courses",
    sub: "Undergraduate & short-term",
    iconTheme:
      "bg-gradient-to-br from-[#1E3A8A] via-[#1d4ed8] to-[#2563EB] shadow-[0_6px_20px_-4px_rgba(30,58,138,0.55)] group-hover:shadow-[0_8px_28px_-4px_rgba(30,58,138,0.65)]",
  },
  {
    icon: Users,
    target: 3000,
    suffix: "+",
    titleRest: " Students",
    sub: "Active learners on campus",
    iconTheme:
      "bg-gradient-to-br from-[#0f766e] via-[#14b8a6] to-[#2dd4bf] shadow-[0_6px_20px_-4px_rgba(13,148,136,0.45)] group-hover:shadow-[0_8px_28px_-4px_rgba(13,148,136,0.55)]",
  },
  {
    icon: School,
    target: 118,
    suffix: "",
    titleRest: " Staff",
    sub: "Teaching & non-teaching",
    iconTheme:
      "bg-gradient-to-br from-[#4f46e5] via-[#6366f1] to-[#818cf8] shadow-[0_6px_20px_-4px_rgba(79,70,229,0.40)] group-hover:shadow-[0_8px_28px_-4px_rgba(79,70,229,0.55)]",
  },
] as const

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])
  return reduced
}

function useCountUp(target: number, active: boolean, durationMs: number, skip: boolean) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) return
    if (skip) {
      setValue(target)
      return
    }
    let start: number | null = null
    let rafId = 0
    const tick = (now: number) => {
      if (start === null) start = now
      const elapsed = now - start
      const t = Math.min(elapsed / durationMs, 1)
      setValue(Math.round(easeOutCubic(t) * target))
      if (t < 1) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [active, target, durationMs, skip])

  return value
}

const cardShell =
  "group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-b from-white to-slate-50/90 p-6 shadow-[0_4px_24px_-6px_rgba(15,23,42,0.07)] transition-all duration-300 ease-out before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#2563EB]/25 before:to-transparent hover:-translate-y-1 hover:border-[#2563EB]/25 hover:shadow-[0_12px_40px_-12px_rgba(30,58,138,0.18)]"

function StatNumericCard({
  icon: Icon,
  target,
  suffix,
  titleRest,
  sub,
  iconTheme,
  active,
  reducedMotion,
}: {
  icon: (typeof STATS)[number]["icon"]
  target: number
  suffix: string
  titleRest: string
  sub: string
  iconTheme: (typeof STATS)[number]["iconTheme"]
  active: boolean
  reducedMotion: boolean
}) {
  const n = useCountUp(target, active, target >= 1000 ? 2200 : 1600, reducedMotion)

  return (
    <div className={cardShell}>
      <div
        className={cn(
          "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl text-white ring-1 ring-white/25 transition duration-300 group-hover:scale-[1.06]",
          iconTheme
        )}
      >
        <Icon className="h-6 w-6" aria-hidden strokeWidth={1.75} />
      </div>
      <h3 className="font-heading text-lg font-bold leading-snug tracking-tight md:text-xl">
        <span className="bg-gradient-to-br from-slate-900 via-slate-800 to-[#1E3A8A] bg-clip-text tabular-nums text-transparent">
          {n}
          {suffix}
          {titleRest}
        </span>
      </h3>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-600 md:text-sm">{sub}</p>
    </div>
  )
}

function NaacCard() {
  return (
    <div className={cardShell}>
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#b45309] via-[#f59e0b] to-[#fde68a] text-white shadow-[0_6px_20px_-4px_rgba(245,158,11,0.38)] ring-1 ring-white/25 transition duration-300 group-hover:scale-[1.06] group-hover:shadow-[0_8px_28px_-4px_rgba(245,158,11,0.55)]">
        <Award className="h-6 w-6" aria-hidden strokeWidth={1.75} />
      </div>
      <h3 className="font-heading text-lg font-bold leading-snug text-slate-900 md:text-xl">
        <span className="block bg-gradient-to-br from-slate-900 to-slate-800 bg-clip-text text-transparent">
          NAAC Accredited
        </span>
        <span className="mt-0.5 block text-[#1E3A8A]">&lsquo;B&rsquo; Grade</span>
      </h3>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-600 md:text-sm">Quality assured education</p>
    </div>
  )
}

export default function HomeStatsHighlights() {
  const sectionRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true)
          io.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-label="Key statistics"
      className="relative overflow-hidden border-y border-slate-200/70 bg-[#F4F7FB] py-10 md:py-14"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-30%,rgba(37,99,235,0.09),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[length:32px_32px] bg-[linear-gradient(to_right,rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.07)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {STATS.map((s) => (
            <StatNumericCard
              key={s.titleRest}
              {...s}
              active={active}
              reducedMotion={reducedMotion}
            />
          ))}
          <NaacCard />
        </div>
      </div>
    </section>
  )
}
