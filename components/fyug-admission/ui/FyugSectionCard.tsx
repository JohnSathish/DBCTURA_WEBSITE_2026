"use client"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { forwardRef } from "react"

type Props = {
  id?: string
  icon: LucideIcon
  title: string
  subtitle?: string
  accent?: "blue" | "green" | "violet" | "amber"
  children: ReactNode
  className?: string
}

const accentMap = {
  blue: { icon: "text-[#2563EB] bg-blue-50", title: "text-[#0F4C81]" },
  green: { icon: "text-emerald-600 bg-emerald-50", title: "text-emerald-800" },
  violet: { icon: "text-violet-600 bg-violet-50", title: "text-violet-900" },
  amber: { icon: "text-amber-600 bg-amber-50", title: "text-amber-900" },
}

const FyugSectionCard = forwardRef<HTMLElement, Props>(function FyugSectionCard(
  { id, icon: Icon, title, subtitle, accent = "blue", children, className },
  ref
) {
  const colors = accentMap[accent]

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3 }}
      className={cn(
        "scroll-mt-28 rounded-[18px] border border-[#DCE3EC]/60 bg-white p-8 shadow-lg shadow-slate-200/50 sm:p-9",
        className
      )}
    >
      <header className="mb-8 border-b border-[#DCE3EC]/80 pb-5">
        <div className="flex items-start gap-4">
          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", colors.icon)}>
            <Icon className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h2 className={cn("font-heading text-xl font-semibold sm:text-[26px]", colors.title)}>{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>
      </header>
      {children}
    </motion.section>
  )
})

export default FyugSectionCard
