"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = {
  initialApplyNowUrl: string
  initialOnlineAdmissionUrl: string
}

const DEFAULT_URL = "https://admissionsdbctura.com/register"

export default function AdmissionLinksSettings({ initialApplyNowUrl, initialOnlineAdmissionUrl }: Props) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [applyNowUrl, setApplyNowUrl] = useState(initialApplyNowUrl || DEFAULT_URL)
  const [onlineAdmissionUrl, setOnlineAdmissionUrl] = useState(initialOnlineAdmissionUrl || DEFAULT_URL)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setApplyNowUrl(initialApplyNowUrl || DEFAULT_URL)
    setOnlineAdmissionUrl(initialOnlineAdmissionUrl || DEFAULT_URL)
  }, [initialApplyNowUrl, initialOnlineAdmissionUrl])

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError(null)
    try {
      const res = await fetch("/api/settings/admission-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applyNowUrl: applyNowUrl.trim() || DEFAULT_URL,
          onlineAdmissionUrl: onlineAdmissionUrl.trim() || DEFAULT_URL,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Failed to save")
      setApplyNowUrl(String(json.applyNowUrl || DEFAULT_URL))
      setOnlineAdmissionUrl(String(json.onlineAdmissionUrl || DEFAULT_URL))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err?.message || "Failed to save")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-2xl border-slate-200">
      <CardHeader>
        <CardTitle>Admission Links</CardTitle>
        <CardDescription>
          Update the URLs for the homepage “Apply Now” button and header “Online Admission” button.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apply-now-url">Apply Now URL</Label>
            <Input
              id="apply-now-url"
              value={applyNowUrl}
              onChange={(e) => setApplyNowUrl(e.target.value)}
              placeholder={DEFAULT_URL}
              className="rounded-xl"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="online-admission-url">Online Admission URL</Label>
            <Input
              id="online-admission-url"
              value={onlineAdmissionUrl}
              onChange={(e) => setOnlineAdmissionUrl(e.target.value)}
              placeholder={DEFAULT_URL}
              className="rounded-xl"
              disabled={loading}
            />
          </div>

          {error ? (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl">{error}</div>
          ) : null}
          {success ? (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
              Admission links updated successfully!
            </div>
          ) : null}

          <Button type="submit" disabled={loading} className="rounded-xl">
            {loading ? "Saving..." : "Save Admission Links"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

