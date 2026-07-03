"use client"

import { cn } from "@/lib/utils"
import { Check, ChevronDown, Search } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"

type Option = { value: string; label: string }

type Props = {
  label: string
  options: Option[]
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  icon?: React.ReactNode
  searchable?: boolean
}

export default function FyugSearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Select…",
  required,
  error,
  icon,
  searchable = true,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const selected = options.find((o) => o.value === value)
  const filtered = searchable
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  return (
    <div ref={rootRef} className="relative space-y-2">
      <span className="block text-[15px] font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-[#EF4444]">*</span>}
      </span>

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-[52px] w-full items-center gap-3 rounded-xl border bg-white px-4 text-left text-base transition-all",
          "border-[#DCE3EC] hover:border-[#2563EB]/60 focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/12",
          error && "border-[#EF4444]",
          !selected && "text-slate-400"
        )}
      >
        {icon && <span className="text-slate-400">{icon}</span>}
        <span className="flex-1 truncate">{selected?.label ?? placeholder}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-[#DCE3EC] bg-white shadow-xl">
          {searchable && (
            <div className="border-b border-[#DCE3EC] p-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  className="h-10 w-full rounded-lg border border-[#DCE3EC] bg-slate-50 pl-9 pr-3 text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/12"
                  autoFocus
                />
              </div>
            </div>
          )}
          <ul id={listId} role="listbox" className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-500">No results</li>
            ) : (
              filtered.map((opt) => (
                <li key={opt.value} role="option" aria-selected={opt.value === value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value)
                      setOpen(false)
                      setQuery("")
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-blue-50",
                      opt.value === value && "bg-blue-50 font-medium text-[#2563EB]"
                    )}
                  >
                    {opt.label}
                    {opt.value === value && <Check className="h-4 w-4" />}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {error && (
        <p className="text-[13px] text-[#EF4444]" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
