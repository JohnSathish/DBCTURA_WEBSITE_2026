"use client"

import { CheckCircle2, Info } from "lucide-react"
import { motion } from "framer-motion"

const checkpoints = [
  "Bona fide student of an NEHU-affiliated college (including Don Bosco College, Tura)",
  "Currently pursuing Four-Year Undergraduate Programme (FYUP) under NEP 2020",
  "Must have successfully completed Semester V without any back papers",
]

export default function FyugEligibilityNotice() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
      className="rounded-[18px] border border-amber-200/80 bg-gradient-to-br from-amber-50 to-amber-100/60 p-6 shadow-md shadow-amber-100/50 sm:p-8"
      role="alert"
    >
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-700">
          <Info className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-amber-950 sm:text-xl">Eligibility Notice</h2>
          <p className="mt-2 text-sm leading-relaxed text-amber-900/90 sm:text-[15px]">
            Students who are bona fide students of any college affiliated with North Eastern Hill
            University (NEHU), Shillong, including Don Bosco College, Tura, and are currently
            pursuing the Four-Year Undergraduate Programme (FYUP) under NEP 2020 are invited to
            register their interest for admission to the Fourth-Year Undergraduate Honours Programme
            at Don Bosco College, Tura.
          </p>
          <ul className="mt-4 space-y-2">
            {checkpoints.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-amber-950/90">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}
