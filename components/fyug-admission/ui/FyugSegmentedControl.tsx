"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { FYUG_INPUT_HEIGHT, FYUG_LABEL_GAP } from "./fyug-theme"

type Props = {
  label: string
  value: boolean | null
  onChange: (v: boolean) => void
  required?: boolean
  error?: string
}

export default function FyugSegmentedControl({ label, value, onChange, required, error }: Props) {
  return (
    <div className={FYUG_LABEL_GAP}>
      <span className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-[#EF4444]">*</span>}
      </span>
      <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label={label}>
        {[
          { val: true, label: "Yes" },
          { val: false, label: "No" },
        ].map(({ val, label: optLabel }) => {
          const selected = value === val
          return (
            <button
              key={optLabel}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(val)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-all",
                FYUG_INPUT_HEIGHT,
                selected
                  ? "border-[#2563EB] bg-blue-50 text-[#0F4C81] shadow-sm"
                  : "border-[#DCE3EC] bg-white text-slate-600 hover:border-blue-200 hover:bg-slate-50"
              )}
            >
              {selected && <Check className="h-3.5 w-3.5 text-[#2563EB]" />}
              {optLabel}
            </button>
          )
        })}
      </div>
      {error && (
        <p className="text-[13px] text-[#EF4444]" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
