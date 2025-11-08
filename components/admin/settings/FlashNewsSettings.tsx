"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function FlashNewsSettings({ initialValue }: { initialValue: string }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(initialValue)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      const response = await fetch("/api/settings/flash-news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        throw new Error("Failed to save")
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error("Error saving flash news:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flash News</CardTitle>
        <CardDescription>
          Manage the scrolling announcement banner displayed on the homepage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="flash-news">Flash News Message</Label>
            <Textarea
              id="flash-news"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Library is Open from Monday to Friday from 06:00 am to 06:45 pm and Saturday from 06:00 am to 04:00 pm."
              rows={3}
              className="resize-none"
            />
            <p className="text-sm text-gray-500">
              Leave empty to hide the flash news banner. The text will scroll automatically.
            </p>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-lg text-sm">
              Flash news updated successfully!
            </div>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Flash News"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}



