"use client"

import Image from "next/image"
import { GraduationCap } from "lucide-react"
import { motion } from "framer-motion"
import { FYUG_ACADEMIC_SESSION } from "@/lib/fyug-admission-constants"

export default function FyugPortalHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative overflow-hidden rounded-[18px] bg-[#0F4C81] text-white shadow-xl shadow-[#0F4C81]/20"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F4C81] via-[#0d3d6b] to-[#0a2f52] opacity-95" />
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5" />
      <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/5" />

      <div className="relative flex flex-col gap-6 p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-center gap-5 text-center md:flex-row md:text-left">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-white p-1 shadow-lg ring-4 ring-white/20">
            <Image src="/logo.png" alt="Don Bosco College" width={80} height={80} className="rounded-full" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100/90">
              Don Bosco College, Tura
            </p>
            <h1 className="mt-1 font-heading text-2xl font-bold leading-tight sm:text-3xl md:text-[2rem]">
              DON BOSCO COLLEGE, TURA
            </h1>
            <p className="mt-2 text-sm text-blue-100/90 sm:text-base">
              Affiliated to North Eastern Hill University (NEHU), Shillong
            </p>
            <p className="mt-1 text-xs text-blue-200/80">NAAC Accredited College</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 md:items-end">
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
            <GraduationCap className="h-5 w-5 text-[#F59E0B]" aria-hidden />
            <span>Academic Session {FYUG_ACADEMIC_SESSION}</span>
          </div>
          <p className="max-w-md text-center text-sm font-medium leading-snug text-amber-300 md:text-right md:text-base">
            Registration for Fourth-Year Undergraduate Honours Programme (NEP 2020)
          </p>
        </div>
      </div>
    </motion.header>
  )
}
