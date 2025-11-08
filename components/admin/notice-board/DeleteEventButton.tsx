"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/notice-board/${eventId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert("Failed to delete event")
      }
    } catch (error) {
      alert("Failed to delete event")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Button
      onClick={handleDelete}
      variant="outline"
      size="sm"
      className="text-red-600 hover:text-red-700"
      disabled={deleting}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}

