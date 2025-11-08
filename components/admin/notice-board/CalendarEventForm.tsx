"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalendarEvent {
  date: string
  title: string
  description: string
}

export default function CalendarEventForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set())
  const [events, setEvents] = useState<Map<string, CalendarEvent>>(new Map())

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // Generate calendar days
  const calendarDays: (Date | null)[] = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day))
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth(
      new Date(year, month + (direction === "next" ? 1 : -1), 1)
    )
  }

  const toggleDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    const newSelected = new Set(selectedDates)
    
    if (newSelected.has(dateStr)) {
      newSelected.delete(dateStr)
      const newEvents = new Map(events)
      newEvents.delete(dateStr)
      setEvents(newEvents)
    } else {
      newSelected.add(dateStr)
      if (!events.has(dateStr)) {
        const newEvents = new Map(events)
        newEvents.set(dateStr, {
          date: dateStr,
          title: "",
          description: "",
        })
        setEvents(newEvents)
      }
    }
    
    setSelectedDates(newSelected)
  }

  const updateEvent = (dateStr: string, field: keyof CalendarEvent, value: string) => {
    const newEvents = new Map(events)
    const event = newEvents.get(dateStr) || {
      date: dateStr,
      title: "",
      description: "",
    }
    newEvents.set(dateStr, { ...event, [field]: value })
    setEvents(newEvents)
  }

  const onSubmit = async () => {
    setLoading(true)
    setError("")

    try {
      const eventsToCreate = Array.from(events.values()).filter(
        (e) => e.title.trim() !== ""
      )

      if (eventsToCreate.length === 0) {
        setError("Please add at least one event with a title")
        setLoading(false)
        return
      }

      // Create all events
      const promises = eventsToCreate.map((event) =>
        fetch("/api/notice-board", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: event.title,
            description: event.description || null,
            eventDate: event.date,
            displayOrder: 0,
            published: true,
          }),
        })
      )

      const results = await Promise.all(promises)
      const failed = results.filter((r) => !r.ok)

      if (failed.length > 0) {
        throw new Error(`Failed to create ${failed.length} event(s)`)
      }

      router.push("/admin/notice-board")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Events for {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => navigateMonth("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold">
              {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
            </h3>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => navigateMonth("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="border rounded-lg p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                (day) => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                )
              )}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, idx) => {
                if (!date) {
                  return <div key={`empty-${idx}`} className="aspect-square" />
                }

                const dateStr = date.toISOString().split("T")[0]
                const isSelected = selectedDates.has(dateStr)
                const isPast = date < today
                const event = events.get(dateStr)

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => !isPast && toggleDate(date)}
                    disabled={isPast}
                    className={cn(
                      "aspect-square border rounded-md text-sm transition-colors",
                      isPast && "opacity-50 cursor-not-allowed bg-gray-100",
                      !isPast && "hover:bg-purple-50 cursor-pointer",
                      isSelected && "bg-purple-100 border-purple-400 ring-2 ring-purple-300",
                      date.getDate() === today.getDate() &&
                        date.getMonth() === today.getMonth() &&
                        date.getFullYear() === today.getFullYear() &&
                        "ring-2 ring-blue-400"
                    )}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span>{date.getDate()}</span>
                      {isSelected && event?.title && (
                        <span className="text-[8px] text-purple-600 truncate w-full px-1">
                          {event.title}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Event Details for Selected Dates */}
          {selectedDates.size > 0 && (
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-lg">Event Details</h4>
              {Array.from(selectedDates)
                .sort()
                .map((dateStr) => {
                  const event = events.get(dateStr) || {
                    date: dateStr,
                    title: "",
                    description: "",
                  }
                  return (
                    <Card key={dateStr} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          <span className="font-medium text-purple-900">
                            {new Date(dateStr).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`title-${dateStr}`}>
                            Event Title *
                          </Label>
                          <Input
                            id={`title-${dateStr}`}
                            value={event.title}
                            onChange={(e) =>
                              updateEvent(dateStr, "title", e.target.value)
                            }
                            placeholder="Enter event title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`desc-${dateStr}`}>
                            Description (Optional)
                          </Label>
                          <Textarea
                            id={`desc-${dateStr}`}
                            value={event.description}
                            onChange={(e) =>
                              updateEvent(dateStr, "description", e.target.value)
                            }
                            placeholder="Enter event description"
                            rows={2}
                          />
                        </div>
                      </div>
                    </Card>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button onClick={onSubmit} disabled={loading || selectedDates.size === 0}>
          {loading ? "Creating..." : `Create ${selectedDates.size} Event(s)`}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/notice-board")}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}



