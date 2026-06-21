"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Pencil, Trash2, Eye } from "lucide-react"
import { adminCellActions, adminCellWrap } from "@/components/admin/admin-table-classes"

interface NewsItem {
  id: string
  title: string
  slug: string
  publishedAt: Date | null
  featured: boolean
  category?: string | null
  updatedAt: Date
}

export default function NewsList({ initialNews }: { initialNews: NewsItem[] }) {
  const [news, setNews] = useState(initialNews)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [newsToDelete, setNewsToDelete] = useState<NewsItem | null>(null)

  const handleDelete = async () => {
    if (!newsToDelete) return

    try {
      const response = await fetch(`/api/news/${newsToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setNews(news.filter((n) => n.id !== newsToDelete.id))
        setDeleteDialogOpen(false)
        setNewsToDelete(null)
      }
    } catch (error) {
      console.error("Failed to delete news:", error)
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border bg-white">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[36%]">Title</TableHead>
              <TableHead className="w-[12%] whitespace-nowrap">Category</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Featured</TableHead>
              <TableHead className="whitespace-nowrap">Published</TableHead>
              <TableHead className={adminCellActions}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                  No news articles yet. Create your first article!
                </TableCell>
              </TableRow>
            ) : (
              news.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className={`font-medium ${adminCellWrap}`}>
                    <span className="line-clamp-3" title={item.title}>
                      {item.title}
                    </span>
                  </TableCell>
                    <TableCell>{item.category || "-"}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.publishedAt
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.publishedAt ? "Published" : "Draft"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.featured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          Featured
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell className={adminCellActions}>
                      <div className="flex justify-end gap-2">
                        {item.publishedAt && (
                          <Link href={`/news/${item.slug}`} target="_blank">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        <Link href={`/admin/news/${item.id}`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setNewsToDelete(item)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete News Article</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{newsToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setNewsToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

