"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  eventDate: z.string().min(1, "Event date is required"),
  displayOrder: z.number().min(0).default(0),
  published: z.boolean().default(true),
})

type EventFormData = z.input<typeof eventSchema>

interface NoticeBoardEvent {
  id: string
  title: string
  description: string | null
  eventDate: Date
  displayOrder: number
  published: boolean
}

interface EventFormProps {
  event?: NoticeBoardEvent
}

export default function EventForm({ event }: EventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: event
      ? {
          title: event.title,
          description: event.description || "",
          eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split("T")[0] : "",
          displayOrder: event.displayOrder,
          published: event.published,
        }
      : {
          title: "",
          description: "",
          eventDate: "",
          displayOrder: 0,
          published: true,
        },
  })

  const published = watch("published") ?? true

  const onSubmit = async (data: EventFormData) => {
    setLoading(true)
    setError("")

    try {
      const url = event ? `/api/notice-board/${event.id}` : "/api/notice-board"
      const method = event ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          displayOrder: typeof data.displayOrder === "number" ? data.displayOrder : 0,
          published: typeof data.published === "boolean" ? data.published : true,
          description: data.description || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save event")
      }

      router.push("/admin/notice-board")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="e.g., Academic Leadership Training Programme (CPELL)"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Brief description of the event"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventDate">Event Date *</Label>
            <Input
              id="eventDate"
              type="date"
              {...register("eventDate")}
            />
            {errors.eventDate && (
              <p className="text-sm text-red-600">{errors.eventDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input
              id="displayOrder"
              type="number"
              {...register("displayOrder", { valueAsNumber: true })}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={published}
              onCheckedChange={(checked) => setValue("published", checked)}
            />
            <Label htmlFor="published" className="cursor-pointer">
              Published
            </Label>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : event ? "Update Event" : "Create Event"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/notice-board")}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

