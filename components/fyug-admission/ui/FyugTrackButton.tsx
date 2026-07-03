"use client"

import Link from "next/link"
import { Search } from "lucide-react"
import { motion } from "framer-motion"

export default function FyugTrackButton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className="flex justify-center"
    >
      <Link
        href="/admissions/fyug-2026/status"
        className="group inline-flex h-12 items-center gap-2 rounded-xl border-2 border-[#2563EB] bg-white px-6 text-[15px] font-semibold text-[#2563EB] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2563EB]/20"
      >
        <Search className="h-4 w-4 transition group-hover:scale-110" aria-hidden />
        Track Application Status
      </Link>
    </motion.div>
  )
}
