"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ADMISSION_LINKS_DEFAULTS,
  type AdmissionLinksConfig,
  type HeaderCtaMode,
} from "@/lib/admission-links-settings"

type Props = {
  initialConfig: AdmissionLinksConfig
}

export default function AdmissionLinksSettings({ initialConfig }: Props) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [config, setConfig] = useState<AdmissionLinksConfig>(initialConfig)

  useEffect(() => {
    setConfig(initialConfig)
  }, [initialConfig])

  const setField = <K extends keyof AdmissionLinksConfig>(key: K, value: AdmissionLinksConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError(null)
    try {
      const res = await fetch("/api/settings/admission-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Failed to save")
      setConfig({
        applyNowUrl: json.applyNowUrl,
        onlineAdmissionUrl: json.onlineAdmissionUrl,
        prospectusUrl: json.prospectusUrl,
        headerCtaMode: json.headerCtaMode,
        fyugAdmissionUrl: json.fyugAdmissionUrl,
        fyugAdmissionLabel: json.fyugAdmissionLabel,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-2xl border-slate-200">
      <CardHeader>
        <CardTitle>Admission Links</CardTitle>
        <CardDescription>
          Control homepage “Apply Now”, header motto buttons, and custom URLs. Switch between FYUG
          registration and the standard Online Admission + Prospectus buttons when admission season
          changes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSave} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="header-cta-mode">Header motto buttons (below “Pursuit of Excellence”)</Label>
            <Select
              value={config.headerCtaMode}
              onValueChange={(v) => setField("headerCtaMode", v as HeaderCtaMode)}
              disabled={loading}
            >
              <SelectTrigger id="header-cta-mode" className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fyug">Single button — FYUG Admission</SelectItem>
                <SelectItem value="dual">Dual buttons — Online Admission + Prospectus</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Use <strong>FYUG Admission</strong> during Fourth-Year Honours registration. Switch back to
              dual buttons during general admission season.
            </p>
          </div>

          {config.headerCtaMode === "fyug" ? (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm font-medium text-slate-700">FYUG button</p>
              <div className="space-y-2">
                <Label htmlFor="fyug-label">Button label</Label>
                <Input
                  id="fyug-label"
                  value={config.fyugAdmissionLabel}
                  onChange={(e) => setField("fyugAdmissionLabel", e.target.value)}
                  placeholder={ADMISSION_LINKS_DEFAULTS.fyugAdmissionLabel}
                  className="rounded-xl"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fyug-url">Button link</Label>
                <Input
                  id="fyug-url"
                  value={config.fyugAdmissionUrl}
                  onChange={(e) => setField("fyugAdmissionUrl", e.target.value)}
                  placeholder={ADMISSION_LINKS_DEFAULTS.fyugAdmissionUrl}
                  className="rounded-xl"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Use a site path (e.g. /admissions/fyug-2026) or full URL (https://…).
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm font-medium text-slate-700">Dual header buttons</p>
              <div className="space-y-2">
                <Label htmlFor="online-admission-url">Online Admission URL</Label>
                <Input
                  id="online-admission-url"
                  value={config.onlineAdmissionUrl}
                  onChange={(e) => setField("onlineAdmissionUrl", e.target.value)}
                  placeholder={ADMISSION_LINKS_DEFAULTS.onlineAdmissionUrl}
                  className="rounded-xl"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prospectus-url">Prospectus link</Label>
                <Input
                  id="prospectus-url"
                  value={config.prospectusUrl}
                  onChange={(e) => setField("prospectusUrl", e.target.value)}
                  placeholder={ADMISSION_LINKS_DEFAULTS.prospectusUrl}
                  className="rounded-xl"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="space-y-2 border-t border-slate-200 pt-4">
            <Label htmlFor="apply-now-url">Homepage hero “Apply Now” URL</Label>
            <Input
              id="apply-now-url"
              value={config.applyNowUrl}
              onChange={(e) => setField("applyNowUrl", e.target.value)}
              placeholder={ADMISSION_LINKS_DEFAULTS.applyNowUrl}
              className="rounded-xl"
              disabled={loading}
            />
          </div>

          {error ? (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl">
              {error}
            </div>
          ) : null}
          {success ? (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
              Admission settings updated successfully!
            </div>
          ) : null}

          <Button type="submit" disabled={loading} className="rounded-xl">
            {loading ? "Saving..." : "Save Admission Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
