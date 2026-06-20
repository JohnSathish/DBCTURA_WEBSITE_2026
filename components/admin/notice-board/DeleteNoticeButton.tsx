"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export function DeleteNoticeButton({ noticeId }: { noticeId: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this notice?")) return
    setDeleting(true)
    try {
      const response = await fetch(`/api/notice-board/notices/${noticeId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        router.refresh()
      } else {
        alert("Failed to delete notice")
      }
    } catch {
      alert("Failed to delete notice")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Button
      onClick={handleDelete}
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
      disabled={deleting}
      aria-label="Delete notice"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}

