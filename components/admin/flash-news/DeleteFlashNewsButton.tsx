"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export function DeleteFlashNewsButton({ flashNewsId }: { flashNewsId: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this flash news item?")) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/flash-news/${flashNewsId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert("Failed to delete flash news")
      }
    } catch (error) {
      alert("Failed to delete flash news")
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

