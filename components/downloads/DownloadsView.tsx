"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  ArrowLeft,
  Download,
  ExternalLink,
  File,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Home,
  Search,
  Sparkles,
} from "lucide-react"

export type DownloadItem = {
  id: string
  title: string
  description: string | null
  file: string
  category: string | null
  uploadedAt: string
}

function fileMeta(file: string) {
  const ext = file.split(".").pop()?.toLowerCase() ?? ""
  switch (ext) {
    case "pdf":
      return { label: "PDF", Icon: FileText, tone: "bg-red-500/10 text-red-700 ring-red-500/20" }
    case "doc":
    case "docx":
      return { label: "DOC", Icon: FileText, tone: "bg-blue-500/10 text-blue-700 ring-blue-500/20" }
    case "xls":
    case "xlsx":
      return { label: "XLS", Icon: FileSpreadsheet, tone: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20" }
    default:
      return { label: ext.toUpperCase() || "FILE", Icon: File, tone: "bg-slate-500/10 text-slate-700 ring-slate-500/20" }
  }
}

export default function DownloadsView({ downloads }: { downloads: DownloadItem[] }) {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const categories = useMemo(() => {
    const set = new Set<string>()
    downloads.forEach((d) => set.add(d.category || "Uncategorized"))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [downloads])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return downloads.filter((d) => {
      const cat = d.category || "Uncategorized"
      if (activeCategory !== "all" && cat !== activeCategory) return false
      if (!q) return true
      return (
        d.title.toLowerCase().includes(q) ||
        (d.description?.toLowerCase().includes(q) ?? false) ||
        cat.toLowerCase().includes(q)
      )
    })
  }, [downloads, query, activeCategory])

  const grouped = useMemo(() => {
    const map = new Map<string, DownloadItem[]>()
    filtered.forEach((d) => {
      const cat = d.category || "Uncategorized"
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(d)
    })
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  return (
    <div className="min-h-screen bg-brand-surface">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#1e40af] text-white">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_45%)]" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider ring-1 ring-white/20 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
                Resource centre
              </div>
              <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">Downloads</h1>
              <p className="mt-3 text-base text-white/85 sm:text-lg">
                Forms, prospectuses, and official documents — search, filter, and download in one place.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-2xl bg-white/10 px-4 py-2.5 ring-1 ring-white/15 backdrop-blur-md">
                  <p className="text-2xl font-bold leading-none">{downloads.length}</p>
                  <p className="mt-1 text-xs text-white/75">Total files</p>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-2.5 ring-1 ring-white/15 backdrop-blur-md">
                  <p className="text-2xl font-bold leading-none">{categories.length}</p>
                  <p className="mt-1 text-xs text-white/75">Categories</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                <Home className="h-4 w-4" aria-hidden />
                Go to Home
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#1E3A8A] shadow-lg shadow-black/10 transition hover:bg-white/95"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Go Back
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-8 pb-16 relative z-10">
        {downloads.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-12 text-center shadow-xl shadow-[#1e3a8a]/5 backdrop-blur-md">
            <FolderOpen className="mx-auto h-12 w-12 text-slate-300" aria-hidden />
            <p className="mt-4 text-lg font-medium text-slate-700">No downloads available yet.</p>
            <p className="mt-1 text-sm text-slate-500">Check back soon for forms and documents.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Search + filters */}
            <div className="rounded-3xl border border-white/60 bg-white/90 p-5 sm:p-6 shadow-xl shadow-[#1e3a8a]/8 backdrop-blur-md ring-1 ring-slate-200/60">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, description, or category…"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCategory("all")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    activeCategory === "all"
                      ? "bg-[#1E3A8A] text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All ({downloads.length})
                </button>
                {categories.map((cat) => {
                  const count = downloads.filter((d) => (d.category || "Uncategorized") === cat).length
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                        activeCategory === cat
                          ? "bg-[#1E3A8A] text-white shadow-md"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  )
                })}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center">
                <p className="font-medium text-slate-700">No files match your search.</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("")
                    setActiveCategory("all")
                  }}
                  className="mt-3 text-sm font-semibold text-[#1E3A8A] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              grouped.map(([category, items]) => (
                <section key={category}>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E3A8A]/10 text-[#1E3A8A] ring-1 ring-[#1E3A8A]/15">
                      <FolderOpen className="h-5 w-5" aria-hidden />
                    </div>
                    <div>
                      <h2 className="font-heading text-xl font-bold text-brand-text">{category}</h2>
                      <p className="text-xs text-slate-500">{items.length} file{items.length === 1 ? "" : "s"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {items.map((download) => {
                      const meta = fileMeta(download.file)
                      const Icon = meta.Icon
                      return (
                        <article
                          key={download.id}
                          className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#2563EB]/30 hover:shadow-xl hover:shadow-[#1e3a8a]/10"
                        >
                          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-amber-400 opacity-80 transition group-hover:opacity-100" />

                          <div className="p-5 sm:p-6">
                            <div className="flex items-start justify-between gap-3">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ${meta.tone}`}
                              >
                                <Icon className="h-3.5 w-3.5" aria-hidden />
                                {meta.label}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {format(new Date(download.uploadedAt), "MMM d, yyyy")}
                              </span>
                            </div>

                            <h3 className="mt-4 font-heading text-lg font-bold leading-snug text-brand-text group-hover:text-[#1E3A8A] transition-colors">
                              {download.title}
                            </h3>

                            {download.description ? (
                              <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-slate-600">
                                {download.description}
                              </p>
                            ) : null}

                            <div className="mt-5 flex flex-wrap items-center gap-2">
                              <a
                                href={download.file}
                                download
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#1e3a8a]/25 transition hover:brightness-110"
                              >
                                <Download className="h-4 w-4" aria-hidden />
                                Download
                              </a>
                              <a
                                href={download.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#2563EB]/30 hover:bg-slate-50"
                              >
                                <ExternalLink className="h-4 w-4" aria-hidden />
                                Open
                              </a>
                            </div>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
