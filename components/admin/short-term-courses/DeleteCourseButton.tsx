"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export function DeleteCourseButton({ courseId }: { courseId: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this course?")) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/short-term-courses/${courseId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert("Failed to delete course")
      }
    } catch (error) {
      alert("Failed to delete course")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Button
      onClick={handleDelete}
      variant="ghost"
      size="icon"
      className="text-red-600 hover:text-red-700"
      disabled={deleting}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}

