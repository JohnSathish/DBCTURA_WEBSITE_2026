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
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const popupSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  enabled: z.boolean(),
})

type PopupFormData = z.infer<typeof popupSchema>

interface Popup {
  id: string
  title: string
  content: string
  enabled: boolean
}

export default function PopupForm({ popup }: { popup?: Popup }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PopupFormData>({
    resolver: zodResolver(popupSchema),
    defaultValues: popup
      ? {
          title: popup.title,
          content: popup.content,
          enabled: popup.enabled,
        }
      : {
          title: "",
          content: "",
          enabled: false,
        },
  })

  const enabled = watch("enabled")

  const onSubmit = async (data: PopupFormData) => {
    setLoading(true)
    try {
      const url = popup ? `/api/popup/${popup.id}` : "/api/popup"
      const method = popup ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to save popup")
      }

      router.push("/admin/popup")
      router.refresh()
    } catch (error) {
      console.error("Error saving popup:", error)
      alert("Failed to save popup. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Popup Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Popup title (e.g., Admission Notice)"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">HTML Content *</Label>
            <Textarea
              id="content"
              {...register("content")}
              placeholder="<div><h2>Admission Open!</h2><p>Apply now...</p></div>"
              rows={12}
              className="font-mono text-sm"
            />
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content.message}</p>
            )}
            <p className="text-sm text-gray-500">
              Enter HTML code for the popup content. You can include images, links, and formatted text.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={(checked) => setValue("enabled", checked)}
            />
            <Label htmlFor="enabled" className="cursor-pointer">
              Enable this popup
            </Label>
            {enabled && (
              <p className="text-sm text-orange-600 ml-2">
                Note: Enabling this popup will disable all other popups.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : popup ? "Update Popup" : "Create Popup"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}



