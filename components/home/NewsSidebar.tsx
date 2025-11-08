"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"

export type NoticeBoardEvent = {
  id: string
  title: string
  description?: string | null
  eventDate: string | Date
}

function CalendarBadge({ date }: { date?: string | Date | null }) {
  if (!date) return null
  const d = new Date(date)
  const day = d.getDate().toString().padStart(2, "0")
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase()
  return (
    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300 shadow-md">
      <div className="text-center leading-tight">
        <div className="text-[10px] text-purple-700 font-semibold -mb-0.5">{month}</div>
        <div className="text-sm font-bold text-purple-900">{day}</div>
      </div>
    </div>
  )
}

export default function NewsSidebar({ items }: { items: NoticeBoardEvent[]; pageSize?: number }) {
  const [isHovered, setIsHovered] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Get current month/year for the Read More link
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  // Filter and limit to first 5 events
  const displayItems = useMemo(() => {
    if (!items || items.length === 0) {
      return []
    }
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const filtered = items
      .filter(event => {
        if (!event || !event.eventDate) return false
        const eventDate = new Date(event.eventDate)
        eventDate.setHours(0, 0, 0, 0)
        return eventDate >= today
      })
      .slice(0, 5)
    
    return filtered
  }, [items])

  // Auto-scroll through items vertically with smooth upward animation
  useEffect(() => {
    if (displayItems.length === 0 || isHovered || displayItems.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayItems.length)
    }, 5000) // Change event every 5 seconds

    return () => clearInterval(interval)
  }, [displayItems.length, isHovered])

  // Calculate item height for smooth scrolling (approximately 95px per item)
  const itemHeight = 95

  return (
    <Card className="flex flex-col w-full border-2 border-purple-200 shadow-lg h-full">
      {/* Header */}
      <div className="px-4 py-[calc(0.5rem-25px)] border-b bg-gradient-to-r from-purple-500 to-pink-500">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">
            Notice Board
          </h3>
        </div>
        <div className="mt-1 h-1 w-28 bg-cyan-300" />
      </div>
      
      {/* Scrolling Content */}
      <div 
        className="overflow-hidden relative flex-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {displayItems.length === 0 ? (
          <div className="px-4 py-4 text-sm text-slate-500 text-center w-full h-full flex items-center justify-center">
            No events available.
          </div>
        ) : (
          <div 
            className="transition-transform duration-1000 ease-in-out"
            style={{
              transform: `translateY(-${currentIndex * itemHeight}px)`,
            }}
          >
            {displayItems.map((event, idx) => {
              const eventDate = new Date(event.eventDate)
              const month = eventDate.getMonth() + 1
              const year = eventDate.getFullYear()
              return (
                <div
                  key={event.id}
                  className="px-4 py-1.5 border-b border-gray-100 last:border-b-0"
                  style={{ minHeight: `${itemHeight - 5}px`, display: 'flex', alignItems: 'center' }}
                >
                  <Link href={`/notice-board/${year}/${month}`} className="block group w-full">
                    <div className="flex gap-3">
                      <div className="shrink-0">
                        <CalendarBadge date={event.eventDate} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold text-purple-900 leading-snug group-hover:text-purple-600 transition-colors">
                          {event.title}
                        </div>
                        {event.description && (
                          <p className="mt-1 text-[11px] text-gray-600 leading-relaxed line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      <div className="px-4 py-[calc(0.75rem-35px)] border-t bg-gradient-to-r from-purple-50 to-pink-50 text-center">
        <Link 
          href={`/notice-board/${currentYear}/${currentMonth}`} 
          className="text-sm font-medium text-purple-700 hover:text-purple-600 font-semibold transition-colors"
        >
          Read More
        </Link>
      </div>
    </Card>
  )
}
