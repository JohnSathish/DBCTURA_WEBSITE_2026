"use client"

import { cn } from "@/lib/utils"
import { User, UserRound } from "lucide-react"

type Props = {
  value: string
  onChange: (v: string) => void
  error?: string
}

export default function FyugGenderCards({ value, onChange, error }: Props) {
  const options = [
    { id: "Male", label: "Male", icon: User, tint: "hover:border-blue-300 hover:bg-blue-50/50" },
    { id: "Female", label: "Female", icon: UserRound, tint: "hover:border-pink-300 hover:bg-pink-50/50" },
  ] as const

  return (
    <div className="space-y-2">
      <span className="block text-[15px] font-medium text-slate-700">
        Gender <span className="text-[#EF4444]">*</span>
      </span>
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Gender">
        {options.map(({ id, label, icon: Icon, tint }) => {
          const selected = value === id
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(id)}
              className={cn(
                "flex h-[52px] items-center justify-center gap-2 rounded-xl border-2 text-base font-medium transition-all",
                selected
                  ? "border-[#2563EB] bg-blue-50 text-[#0F4C81] shadow-sm shadow-blue-500/10"
                  : cn("border-[#DCE3EC] bg-white text-slate-600", tint)
              )}
            >
              <Icon className={cn("h-5 w-5", selected ? "text-[#2563EB]" : "text-slate-400")} />
              {label}
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
