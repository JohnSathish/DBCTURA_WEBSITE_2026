"use client"

import { useEffect } from "react"

export default function PerfMeasureGuard() {
  useEffect(() => {
    if (typeof window === "undefined") return
    const perf = window.performance
    if (!perf?.measure) return

    const original = perf.measure.bind(perf)

    // Some browser/Next instrumentation can throw:
    // "Performance.measure: Given attribute end cannot be negative"
    // Guard to avoid crashing the app in dev.
    perf.measure = ((name: string, startOrOptions?: any, endMark?: any) => {
      try {
        return original(name, startOrOptions, endMark)
      } catch {
        return undefined as any
      }
    }) as any
  }, [])

  return null
}

