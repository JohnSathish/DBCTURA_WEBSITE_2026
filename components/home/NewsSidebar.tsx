"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatDisplayDate, isRecentNotice } from "@/lib/format-date"
import { Bell, Download, Eye, FileText, Megaphone, Pin } from "lucide-react"

export type NoticeBoardNotice = {
  id: string
  title: string
  noticeType: "document" | "image" | "text" | string
  pdfUrl?: string | null
  imageUrl?: string | null
  publishDate?: string | Date
  important?: boolean
  pinned?: boolean
}

function isNewNotice(publishDate?: string | Date) {
  return isRecentNotice(publishDate, 3)
}

function iconMeta(n: NoticeBoardNotice) {
  const type = String(n.noticeType || "text").toLowerCase()

  // Priority: pinned > important > document > default
  if (n.pinned) {
    return {
      Icon: Pin,
      label: "Pinned",
      iconClass: "text-indigo-700",
      wrapClass: "bg-indigo-50 ring-indigo-100",
    }
  }
  if (n.important) {
    return {
      Icon: Megaphone,
      label: "Important",
      iconClass: "text-red-700",
      wrapClass: "bg-red-50 ring-red-100",
    }
  }
  if (type === "document") {
    return {
      Icon: FileText,
      label: "Document",
      iconClass: "text-emerald-700",
      wrapClass: "bg-emerald-50 ring-emerald-100",
    }
  }
  return {
    Icon: Bell,
    label: "Notice",
    iconClass: "text-blue-700",
    wrapClass: "bg-blue-50 ring-blue-100",
  }
}

export default function NewsSidebar({ items }: { items: NoticeBoardNotice[]; pageSize?: number }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Limit to first 5 notices
  const displayItems = useMemo(() => {
    if (!items || items.length === 0) {
      return []
    }

    return items.slice(0, 5)
  }, [items])

  const [hovered, setHovered] = useState(false)
  const itemHeight = 132
  const shouldScroll = displayItems.length >= 2
  const marqueeItems = shouldScroll ? [...displayItems, ...displayItems] : displayItems
  const durationSec = Math.max(14, displayItems.length * 5)

  return (
    <Card className="flex h-full flex-col w-full border border-brand-gold/35 shadow-md bg-card" suppressHydrationWarning>
      {/* Header */}
      <div className="px-4 py-[calc(0.5rem-25px)] border-b border-brand-sun/50 bg-brand-navy text-white">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white tracking-wide">
            Notice Board
          </h3>
        </div>
        <div className="mt-1 h-1 w-28 bg-brand-sun rounded-sm" />
      </div>
      
      {/* Auto-scroll inside fixed height (does not change card height) */}
      <div
        className="relative flex-1 overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-white to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-white to-transparent" />
        {displayItems.length === 0 ? (
          <div className="px-4 py-4 text-sm text-slate-500 text-center w-full h-full flex items-center justify-center">
            No notices available.
          </div>
        ) : (
          <div
            className={cn("h-full", !shouldScroll || hovered ? "dbc-marquee paused" : "dbc-marquee")}
            style={
              shouldScroll
                ? ({
                    ["--dbc-duration" as any]: `${durationSec}s`,
                    ["--dbc-distance" as any]: `${displayItems.length * itemHeight}px`,
                  } as any)
                : undefined
            }
          >
            <div className="dbc-marquee-track divide-y divide-slate-100">
              {marqueeItems.map((notice, idx) => {
              const meta = iconMeta(notice)
              const isNew = mounted && isNewNotice(notice.publishDate)
              const pubLabel = notice.publishDate ? formatDisplayDate(notice.publishDate) : ""
              const key = `${notice.id}-${idx}`

              return (
                <div
                  key={key}
                  className="px-4 py-3"
                  style={{ height: `${itemHeight}px`, display: "flex", alignItems: "center" }}
                >
                  <div className="flex items-start gap-3 w-full">
                    <span
                      className={cn(
                        "mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 shadow-sm",
                        meta.wrapClass
                      )}
                      title={meta.label}
                      aria-hidden
                    >
                      <meta.Icon className={cn("h-5 w-5", meta.iconClass)} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/notice-board/notices/${notice.id}`}
                            className="block text-[13px] font-semibold text-brand-text leading-snug hover:text-brand-hover transition-colors line-clamp-2"
                          >
                            {notice.title}
                          </Link>

                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            {notice.important ? (
                              <Badge className="bg-red-50 text-red-700 border-red-100">Important</Badge>
                            ) : null}
                            {isNew ? (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">New</Badge>
                            ) : null}
                            {notice.pinned ? (
                              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100">Pinned</Badge>
                            ) : null}
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className="text-[11px] font-semibold text-slate-500">
                            {pubLabel}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <Link href={`/notice-board/notices/${notice.id}`}>
                          <Button variant="outline" className="h-8 rounded-xl px-2.5 text-xs">
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            View
                          </Button>
                        </Link>
                        {notice.pdfUrl ? (
                          <Link href={notice.pdfUrl} target="_blank" rel="noreferrer">
                            <Button className="h-8 rounded-xl bg-blue-600 hover:bg-blue-700 px-2.5 text-xs shadow-sm shadow-blue-600/20">
                              <Download className="h-3.5 w-3.5 mr-1.5" />
                              Download
                            </Button>
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              )
              })}
            </div>
          </div>
        )}
      </div>
      
      <div className="px-4 py-[calc(0.75rem-35px)] border-t bg-slate-100 text-center">
        <Link 
          href="/notice-board"
          className="text-sm font-medium text-brand-text hover:text-brand-hover font-semibold transition-colors"
        >
          Read More
        </Link>
      </div>
      <style jsx>{`
        .dbc-marquee {
          height: 100%;
        }
        .dbc-marquee-track {
          animation: dbc-marquee var(--dbc-duration) linear infinite;
          will-change: transform;
        }
        .dbc-marquee.paused .dbc-marquee-track {
          animation-play-state: paused;
        }
        @keyframes dbc-marquee {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(calc(-1 * var(--dbc-distance)));
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .dbc-marquee-track {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </Card>
  )
}

