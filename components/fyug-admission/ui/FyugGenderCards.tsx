"use client"

import { cn } from "@/lib/utils"
import { User, UserRound } from "lucide-react"
import { FYUG_INPUT_HEIGHT, FYUG_LABEL_GAP } from "./fyug-theme"

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
    <div className={FYUG_LABEL_GAP}>
      <span className="block text-sm font-medium text-slate-700">
        Gender <span className="text-[#EF4444]">*</span>
      </span>
      <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Gender">
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
                "flex items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-all",
                FYUG_INPUT_HEIGHT,
                selected
                  ? "border-[#2563EB] bg-blue-50 text-[#0F4C81] shadow-sm"
                  : cn("border-[#DCE3EC] bg-white text-slate-600", tint)
              )}
            >
              <Icon className={cn("h-4 w-4", selected ? "text-[#2563EB]" : "text-slate-400")} />
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
