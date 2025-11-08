import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar } from "lucide-react"
import { notFound } from "next/navigation"

function CalendarBadge({ date }: { date: Date }) {
  const day = date.getDate().toString().padStart(2, "0")
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase()
  return (
    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300 shadow-md">
      <div className="text-center leading-tight">
        <div className="text-[10px] text-purple-700 font-semibold -mb-0.5">{month}</div>
        <div className="text-sm font-bold text-purple-900">{day}</div>
      </div>
    </div>
  )
}

export default async function EventsByMonthPage({
  params,
}: {
  params: Promise<{ year: string; month: string }>
}) {
  const { year, month } = await params
  const yearNum = parseInt(year)
  const monthNum = parseInt(month)

  if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    notFound()
  }

  const startDate = new Date(yearNum, monthNum - 1, 1)
  const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59)
  
  // Get current date (start of today)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Use the later of startDate or today (so we don't show past events)
  const effectiveStartDate = startDate >= today ? startDate : today

  const events = await prisma.noticeBoardEvent.findMany({
    where: {
      published: true,
      eventDate: {
        gte: effectiveStartDate,
        lte: endDate,
      },
    },
    orderBy: [
      { eventDate: "asc" },
      { displayOrder: "asc" },
    ],
  })

  const monthName = startDate.toLocaleString("en-US", { month: "long", year: "numeric" })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-purple-600 hover:text-purple-700 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-purple-900 mb-2">
            Notice Board Events
          </h1>
          <p className="text-lg text-gray-600">{monthName}</p>
        </div>

        {events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No events scheduled for this month.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const eventDate = new Date(event.eventDate)
              return (
                <Card key={event.id} className="border-2 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="shrink-0">
                        <CalendarBadge date={eventDate} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-purple-900 mb-2">
                          {event.title}
                        </h3>
                        {event.description && (
                          <p className="text-gray-700 leading-relaxed">
                            {event.description}
                          </p>
                        )}
                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {eventDate.toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

