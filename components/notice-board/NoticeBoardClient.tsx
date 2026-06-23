"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { FileText, ImageIcon, Type, Download, Eye, Pin, Bell } from "lucide-react"

export type Notice = {
  id: string
  title: string
  content: string | null
  noticeType: "document" | "image" | "text"
  pdfUrl: string | null
  imageUrl: string | null
  publishDate: string | Date
  expiryDate: string | Date | null
  active: boolean
  important: boolean
  pinned: boolean
  downloadCount?: number
}

function isNewNotice(publishDate: string | Date) {
  const pub = new Date(publishDate).getTime()
  const now = Date.now()
  const diff = now - pub
  return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000
}

function typeMeta(t: Notice["noticeType"]) {
  if (t === "document") return { icon: FileText, label: "PDF" }
  if (t === "image") return { icon: ImageIcon, label: "Image" }
  return { icon: Type, label: "Text" }
}

function stripHtmlToText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export default function NoticeBoardClient({ notices }: { notices: Notice[] }) {
  const [query, setQuery] = useState("")
  const [type, setType] = useState<"all" | Notice["noticeType"]>("all")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (notices || [])
      .filter((n) => (type === "all" ? true : n.noticeType === type))
      .filter((n) => {
        if (!q) return true
        return (
          n.title.toLowerCase().includes(q) ||
          (n.content || "").toLowerCase().includes(q)
        )
      })
  }, [notices, query, type])

  const newCount = useMemo(() => filtered.filter((n) => isNewNotice(n.publishDate)).length, [filtered])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm shadow-slate-900/5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900">Search & Filter</div>
            <div className="mt-1 text-xs text-slate-500">Latest notices, pinned and important on top</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
              <Bell className="h-3.5 w-3.5 text-slate-600" />
              {newCount} New
            </div>
            <div className="flex rounded-xl border border-slate-200 bg-white p-1">
              {(["all", "document", "image", "text"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                    type === t ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {t === "all" ? "All" : t === "document" ? "PDF" : t === "image" ? "Images" : "Text"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mt-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notices…"
            className="h-11 rounded-xl border-slate-200"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No notices found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((n) => {
            const meta = typeMeta(n.noticeType)
            const Icon = meta.icon
            const pub = new Date(n.publishDate)
            const exp = n.expiryDate ? new Date(n.expiryDate) : null
            const isNew = isNewNotice(n.publishDate)

            return (
              <div
                key={n.id}
                className={cn(
                  "group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
                  n.important && "border-red-200"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                        <Icon className="h-3.5 w-3.5" />
                        {meta.label}
                      </span>
                      {n.pinned ? (
                        <Badge className="bg-blue-50 text-blue-700 border-blue-100">
                          <Pin className="h-3.5 w-3.5 mr-1" /> Pinned
                        </Badge>
                      ) : null}
                      {n.important ? (
                        <Badge className="bg-red-50 text-red-700 border-red-100">
                          🔴 Important
                        </Badge>
                      ) : null}
                      {isNew ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">
                          New
                        </Badge>
                      ) : null}
                    </div>

                    <h3 className="mt-3 text-base sm:text-lg font-bold tracking-tight text-slate-900">
                      <Link href={`/notice-board/notices/${n.id}`} className="hover:text-blue-700 transition-colors">
                        {n.title}
                      </Link>
                    </h3>
                    <div className="mt-1 text-xs text-slate-500">
                      Published {pub.toLocaleDateString()}
                      {exp ? ` • Expires ${exp.toLocaleDateString()}` : ""}
                    </div>
                  </div>
                </div>

                {n.noticeType === "image" && n.imageUrl ? (
                  <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <div className="relative aspect-[16/9]">
                      <Image
                        src={n.imageUrl}
                        alt={n.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                ) : null}

                {n.noticeType === "text" && n.content ? (
                  <p className="mt-4 text-sm leading-relaxed text-slate-700 line-clamp-3">
                    {stripHtmlToText(n.content)}
                  </p>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-2">
                  {n.noticeType === "document" && n.pdfUrl ? (
                    <>
                      <Link href={`/api/notice-board/notices/${n.id}/download`}>
                        <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </Link>
                      <Link href={`/notice-board/notices/${n.id}`}>
                        <Button variant="outline" className="rounded-xl">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      {(n.downloadCount ?? 0) > 0 ? (
                        <span className="self-center text-xs text-slate-500">
                          {n.downloadCount!.toLocaleString()} download{n.downloadCount === 1 ? "" : "s"}
                        </span>
                      ) : null}
                    </>
                  ) : null}

                  {n.noticeType === "image" && n.imageUrl ? (
                    <Link href={`/notice-board/notices/${n.id}`}>
                      <Button variant="outline" className="rounded-xl">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                  ) : null}

                  {n.noticeType === "text" ? (
                    <Link href={`/notice-board/notices/${n.id}`}>
                      <Button variant="outline" className="rounded-xl">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

