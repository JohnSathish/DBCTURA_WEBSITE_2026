"use client"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import type { InputHTMLAttributes, ReactNode } from "react"
import { forwardRef } from "react"
import { FYUG_INPUT_HEIGHT, FYUG_LABEL_GAP } from "./fyug-theme"

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  icon?: LucideIcon
  required?: boolean
  helper?: string
  error?: string
  valid?: boolean
  wrapperClassName?: string
  rightSlot?: ReactNode
}

const FyugField = forwardRef<HTMLInputElement, Props>(function FyugField(
  {
    label,
    icon: Icon,
    required,
    helper,
    error,
    valid,
    className,
    wrapperClassName,
    rightSlot,
    id,
    ...props
  },
  ref
) {
  const fieldId = id ?? props.name

  return (
    <div className={cn(FYUG_LABEL_GAP, wrapperClassName)}>
      <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700">
        {label}
        {required && (
          <span className="ml-0.5 text-[#EF4444]" aria-hidden>
            *
          </span>
        )}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
        )}
        <input
          ref={ref}
          id={fieldId}
          className={cn(
            FYUG_INPUT_HEIGHT,
            "w-full rounded-lg border bg-white text-sm text-slate-900 transition-all placeholder:text-slate-400",
            "border-[#DCE3EC] hover:border-[#2563EB]/60",
            "focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15",
            Icon ? "pl-9 pr-9" : "px-3",
            error && "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/15",
            valid && !error && "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/15",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : helper ? `${fieldId}-helper` : undefined}
          {...props}
        />
        {valid && !error && (
          <CheckCircle2
            className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500"
            aria-hidden
          />
        )}
        {error && (
          <AlertCircle
            className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#EF4444]"
            aria-hidden
          />
        )}
        {rightSlot}
      </div>
      {error && (
        <p id={`${fieldId}-error`} className="flex items-center gap-1 text-[13px] text-[#EF4444]" role="alert">
          {error}
        </p>
      )}
      {!error && helper && (
        <p id={`${fieldId}-helper`} className="text-[13px] text-slate-500">
          {helper}
        </p>
      )}
    </div>
  )
})

export default FyugField
