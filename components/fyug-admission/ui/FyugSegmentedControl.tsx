"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

type Props = {
  label: string
  value: boolean | null
  onChange: (v: boolean) => void
  required?: boolean
  error?: string
}

export default function FyugSegmentedControl({ label, value, onChange, required, error }: Props) {
  return (
    <div className="space-y-2">
      <span className="block text-[15px] font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-[#EF4444]">*</span>}
      </span>
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label={label}>
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
                "flex h-[52px] items-center justify-center gap-2 rounded-xl border-2 text-base font-medium transition-all",
                selected
                  ? "border-[#2563EB] bg-blue-50 text-[#0F4C81] shadow-sm"
                  : "border-[#DCE3EC] bg-white text-slate-600 hover:border-blue-200 hover:bg-slate-50"
              )}
            >
              {selected && <Check className="h-4 w-4 text-[#2563EB]" />}
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
