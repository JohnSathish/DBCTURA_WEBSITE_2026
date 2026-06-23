"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import PopupRichTextEditor from "@/components/admin/popup/PopupRichTextEditor"
import PopupPreview from "@/components/admin/popup/PopupPreview"
import PopupImageManager from "@/components/admin/popup/PopupImageManager"
import {
  AUTO_CLOSE_OPTIONS,
  POPUP_POSITIONS,
  POPUP_SIZES,
  POPUP_TYPES,
} from "@/lib/popup-config"
import { popupAnalyticsSummary } from "@/lib/popup-analytics"
import { Copy, Eye } from "lucide-react"

const popupSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  popupType: z.string(),
  displayPosition: z.string(),
  popupSize: z.string(),
  overlayEnabled: z.boolean(),
  autoCloseSeconds: z.number(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  displayOrder: z.number(),
  enabled: z.boolean(),
  published: z.boolean(),
})

type PopupFormData = z.infer<typeof popupSchema>

export type PopupRecord = {
  id: string
  title: string
  content: string
  popupType: string
  displayPosition: string
  popupSize: string
  overlayEnabled: boolean
  autoCloseSeconds: number | null
  startDate: string | Date | null
  endDate: string | Date | null
  displayOrder: number
  enabled: boolean
  published: boolean
  totalViews: number
  uniqueViews: number
  totalClicks: number
  buttonClicks: number
  closeCount: number
  images?: { id: string; imageUrl: string }[]
}

function toDateInput(value: string | Date | null | undefined) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return d.toISOString().slice(0, 16)
}

export default function PopupForm({ popup }: { popup?: PopupRecord }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<{ imageUrl: string }[]>(
    popup?.images?.map((i) => ({ imageUrl: i.imageUrl })) ?? []
  )

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
          popupType: popup.popupType,
          displayPosition: popup.displayPosition,
          popupSize: popup.popupSize,
          overlayEnabled: popup.overlayEnabled,
          autoCloseSeconds: popup.autoCloseSeconds ?? 0,
          startDate: toDateInput(popup.startDate),
          endDate: toDateInput(popup.endDate),
          displayOrder: popup.displayOrder,
          enabled: popup.enabled,
          published: popup.published,
        }
      : {
          title: "",
          content: "",
          popupType: "information",
          displayPosition: "center",
          popupSize: "medium",
          overlayEnabled: true,
          autoCloseSeconds: 0,
          startDate: "",
          endDate: "",
          displayOrder: 0,
          enabled: false,
          published: false,
        },
  })

  const values = watch()
  const analytics = popup ? popupAnalyticsSummary(popup) : null

  const savePopup = async (data: PopupFormData, publish: boolean) => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        published: publish,
        autoCloseSeconds: data.autoCloseSeconds || null,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
      }
      const url = popup ? `/api/popup/${popup.id}` : "/api/popup"
      const method = popup ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Save failed")
      router.push("/admin/popup")
      router.refresh()
    } catch {
      alert("Failed to save popup.")
    } finally {
      setLoading(false)
    }
  }

  const duplicatePopup = async () => {
    if (!popup) return
    const res = await fetch(`/api/popup/${popup.id}/duplicate`, { method: "POST" })
    if (res.ok) {
      const data = await res.json()
      router.push(`/admin/popup/${data.popup.id}/edit`)
    }
  }

  const insertImage = (url: string) => {
    const img = `<p><img src="${url}" alt="" style="max-width:100%;height:auto" /></p>`
    setValue("content", `${values.content}${img}`, { shouldValidate: true })
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit((d) => savePopup(d, true))}>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Popup Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Popup Title *</Label>
                <Input id="title" {...register("title")} placeholder="Admission Open 2026–27" />
                {errors.title ? <p className="text-sm text-red-600">{errors.title.message}</p> : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Popup Type</Label>
                  <Select value={values.popupType} onValueChange={(v) => setValue("popupType", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POPUP_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    {...register("displayOrder", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="datetime-local" {...register("startDate")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="datetime-local" {...register("endDate")} />
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={values.enabled} onCheckedChange={(v) => setValue("enabled", v)} />
                  <Label>Enable popup on website</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={values.overlayEnabled}
                    onCheckedChange={(v) => setValue("overlayEnabled", v)}
                  />
                  <Label>Background overlay</Label>
                </div>
              </div>
              {values.enabled ? (
                <p className="text-sm text-amber-600">Enabling this popup disables other enabled popups.</p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <PopupRichTextEditor
                content={values.content}
                onChange={(html) => setValue("content", html, { shouldValidate: true })}
                onApplyTemplate={(html, type) => {
                  setValue("content", html, { shouldValidate: true })
                  if (type) setValue("popupType", type)
                }}
              />
              {errors.content ? <p className="mt-2 text-sm text-red-600">{errors.content.message}</p> : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Image Upload Manager</CardTitle>
            </CardHeader>
            <CardContent>
              <PopupImageManager
                popupId={popup?.id}
                images={uploadedImages}
                onUploaded={(url) => setUploadedImages((prev) => [{ imageUrl: url }, ...prev])}
                onInsert={insertImage}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4" /> Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PopupPreview
                title={values.title}
                content={values.content}
                popupSize={values.popupSize}
                displayPosition={values.displayPosition}
                overlayEnabled={values.overlayEnabled}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Display Position</Label>
                <Select
                  value={values.displayPosition}
                  onValueChange={(v) => setValue("displayPosition", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POPUP_POSITIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Popup Size</Label>
                <Select value={values.popupSize} onValueChange={(v) => setValue("popupSize", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POPUP_SIZES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Auto Close</Label>
                <Select
                  value={String(values.autoCloseSeconds)}
                  onValueChange={(v) => setValue("autoCloseSeconds", Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUTO_CLOSE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={String(o.value)}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {analytics ? (
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-slate-500">Views</p>
                  <p className="text-xl font-bold">{analytics.views.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-slate-500">Unique</p>
                  <p className="text-xl font-bold">{analytics.uniqueViews.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-slate-500">Clicks</p>
                  <p className="text-xl font-bold">{analytics.clicks.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-slate-500">CTR</p>
                  <p className="text-xl font-bold">{analytics.ctr}%</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-slate-500">Button Clicks</p>
                  <p className="text-xl font-bold">{analytics.buttonClicks.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-slate-500">Closes</p>
                  <p className="text-xl font-bold">{analytics.closeCount.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      <div className="sticky bottom-0 z-10 flex flex-wrap gap-3 border-t border-slate-200 bg-white/95 py-4 backdrop-blur">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Publish Popup"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={loading}
          onClick={handleSubmit((d) => savePopup({ ...d, published: false }, false))}
        >
          Save Draft
        </Button>
        {popup ? (
          <Button type="button" variant="outline" onClick={duplicatePopup}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
        ) : null}
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
