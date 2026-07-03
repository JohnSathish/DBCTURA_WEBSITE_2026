"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export type FyugStepId = "personal" | "parents" | "college" | "academic" | "declaration"

const STEPS: { id: FyugStepId; label: string; short: string }[] = [
  { id: "personal", label: "Personal", short: "①" },
  { id: "parents", label: "Parents", short: "②" },
  { id: "college", label: "College", short: "③" },
  { id: "academic", label: "Academic", short: "④" },
  { id: "declaration", label: "Submit", short: "⑤" },
]

type Props = {
  activeStep: FyugStepId
  completedSteps: Set<FyugStepId>
  onStepClick?: (id: FyugStepId) => void
}

export default function FyugProgressStepper({ activeStep, completedSteps, onStepClick }: Props) {
  const activeIndex = STEPS.findIndex((s) => s.id === activeStep)

  return (
    <nav
      aria-label="Registration progress"
      className="sticky top-0 z-30 -mx-4 border-b border-[#DCE3EC]/80 bg-[#F8FAFC]/95 px-4 py-4 backdrop-blur-md sm:-mx-0 sm:rounded-[18px] sm:border sm:shadow-sm"
    >
      <ol className="mx-auto flex max-w-4xl items-center justify-between gap-1 sm:gap-2">
        {STEPS.map((step, i) => {
          const done = completedSteps.has(step.id)
          const active = step.id === activeStep
          const past = i < activeIndex

          return (
            <li key={step.id} className="flex flex-1 items-center">
              <button
                type="button"
                onClick={() => onStepClick?.(step.id)}
                className={cn(
                  "group flex w-full flex-col items-center gap-1.5 rounded-lg px-1 py-1 transition-colors sm:flex-row sm:gap-2 sm:px-2",
                  onStepClick && "hover:bg-white/60 cursor-pointer"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all sm:h-9 sm:w-9",
                    done || past
                      ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                      : active
                        ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/30 ring-4 ring-blue-500/15"
                        : "border border-[#DCE3EC] bg-white text-slate-500"
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : step.short}
                </span>
                <span
                  className={cn(
                    "hidden text-center text-[11px] font-medium sm:block sm:text-xs",
                    active ? "text-[#2563EB]" : done || past ? "text-emerald-700" : "text-slate-500"
                  )}
                >
                  {step.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-0.5 hidden h-0.5 flex-1 sm:block",
                    i < activeIndex ? "bg-emerald-400" : "bg-[#DCE3EC]"
                  )}
                  aria-hidden
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
