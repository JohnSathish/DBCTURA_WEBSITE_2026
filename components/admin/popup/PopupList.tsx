"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus } from "lucide-react"
import Link from "next/link"

interface Popup {
  id: string
  title: string
  content: string
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export default function PopupList({ initialPopups }: { initialPopups: Popup[] }) {
  const router = useRouter()
  const [popups, setPopups] = useState(initialPopups)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this popup?")) {
      return
    }

    setDeleting(id)
    try {
      const response = await fetch(`/api/popup/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete popup")
      }

      setPopups(popups.filter((popup) => popup.id !== id))
    } catch (error) {
      console.error("Error deleting popup:", error)
      alert("Failed to delete popup. Please try again.")
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Popup Banners</h1>
        <Link href="/admin/popup/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Popup
          </Button>
        </Link>
      </div>

      {popups.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No popups yet.</p>
          <Link href="/admin/popup/new">
            <Button>Create your first popup</Button>
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {popups.map((popup) => (
                <TableRow key={popup.id}>
                  <TableCell className="font-medium">{popup.title}</TableCell>
                  <TableCell>
                    <Badge variant={popup.enabled ? "default" : "secondary"}>
                      {popup.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(popup.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/popup/${popup.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(popup.id)}
                        disabled={deleting === popup.id}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}



