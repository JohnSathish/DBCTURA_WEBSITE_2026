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
import { Copy, Pencil, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { popupAnalyticsSummary } from "@/lib/popup-analytics"
import { POPUP_TYPES } from "@/lib/popup-config"

interface Popup {
  id: string
  title: string
  content: string
  popupType?: string
  enabled: boolean
  published?: boolean
  totalViews?: number
  totalClicks?: number
  uniqueViews?: number
  buttonClicks?: number
  closeCount?: number
  createdAt: string | Date
  updatedAt: string | Date
}

export default function PopupList({ initialPopups }: { initialPopups: Popup[] }) {
  const router = useRouter()
  const [popups, setPopups] = useState(initialPopups)
  const [deleting, setDeleting] = useState<string | null>(null)

  const typeLabel = (value: string) =>
    POPUP_TYPES.find((t) => t.value === value)?.label ?? value

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this popup?")) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/popup/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      setPopups((prev) => prev.filter((p) => p.id !== id))
    } catch {
      alert("Failed to delete popup.")
    } finally {
      setDeleting(null)
    }
  }

  const duplicate = async (id: string) => {
    const res = await fetch(`/api/popup/${id}/duplicate`, { method: "POST" })
    if (res.ok) {
      router.refresh()
      const data = await res.json()
      router.push(`/admin/popup/${data.popup.id}/edit`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Popup Management</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create rich admission notices, announcements, and event banners with live preview.
          </p>
        </div>
        <Link href="/admin/popup/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Popup
          </Button>
        </Link>
      </div>

      {popups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
          <p className="mb-4 text-slate-500">No popups yet.</p>
          <Link href="/admin/popup/new">
            <Button>Create your first popup</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>CTR</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {popups.map((popup) => {
                const stats = popupAnalyticsSummary({
                  totalViews: popup.totalViews ?? 0,
                  totalClicks: popup.totalClicks ?? 0,
                  uniqueViews: popup.uniqueViews ?? 0,
                  buttonClicks: popup.buttonClicks ?? 0,
                  closeCount: popup.closeCount ?? 0,
                })
                return (
                  <TableRow key={popup.id}>
                    <TableCell className="max-w-xs font-medium">{popup.title}</TableCell>
                    <TableCell>{typeLabel(popup.popupType || "information")}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={popup.enabled ? "default" : "secondary"}>
                          {popup.enabled ? "Live" : "Off"}
                        </Badge>
                        <Badge variant={popup.published ? "outline" : "secondary"}>
                          {popup.published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{(popup.totalViews ?? 0).toLocaleString()}</TableCell>
                    <TableCell>{stats.ctr}%</TableCell>
                    <TableCell>{new Date(popup.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/popup/${popup.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => duplicate(popup.id)}>
                          <Copy className="h-4 w-4" />
                        </Button>
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
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
