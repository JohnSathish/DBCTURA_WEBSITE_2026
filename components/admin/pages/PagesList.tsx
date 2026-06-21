"use client"

import React, { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Pencil, Trash2, Eye, Search } from "lucide-react"
import { adminCellActions, adminCellTruncate, adminCellWrap } from "@/components/admin/admin-table-classes"

interface Page {
  id: string
  title: string
  slug: string
  published: boolean
  updatedAt: Date | string
}

export default function PagesList({ initialPages = [] }: { initialPages?: Page[] }) {
  const [pages, setPages] = useState<Page[]>(() =>
    initialPages.map((page) => ({
      ...page,
      updatedAt: page.updatedAt instanceof Date ? page.updatedAt : new Date(page.updatedAt),
    }))
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null)

  // Sync with initialPages when it changes
  useEffect(() => {
    const formattedPages = initialPages.map((page) => ({
      ...page,
      updatedAt: page.updatedAt instanceof Date ? page.updatedAt : new Date(page.updatedAt),
    }))
    setPages(formattedPages)
  }, [initialPages])

  // Filter pages based on search query
  const filteredPages = useMemo(() => {
    if (!pages || pages.length === 0) {
      return []
    }
    
    if (!searchQuery.trim()) {
      return pages
    }

    const query = searchQuery.toLowerCase().trim()
    return pages.filter(
      (page) =>
        page.title.toLowerCase().includes(query) ||
        page.slug.toLowerCase().includes(query)
    )
  }, [pages, searchQuery])

  const handleDelete = async () => {
    if (!pageToDelete) return

    try {
      const response = await fetch(`/api/pages/${pageToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPages(pages.filter((p) => p.id !== pageToDelete.id))
        setDeleteDialogOpen(false)
        setPageToDelete(null)
      }
    } catch (error) {
      console.error("Failed to delete page:", error)
    }
  }

  return (
    <>
      {/* Search Bar */}
      <div className="bg-white rounded-lg border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search pages by title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {((initialPages.length > 0) || (pages && pages.length > 0)) && (
          <p className="text-sm text-gray-600 mt-2">
            {searchQuery ? (
              <>Found {filteredPages.length} page{filteredPages.length !== 1 ? "s" : ""} matching "{searchQuery}"</>
            ) : (
              <>Total: {(initialPages.length > 0 ? initialPages.length : pages.length)} page{(initialPages.length > 0 ? initialPages.length : pages.length) !== 1 ? "s" : ""}</>
            )}
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[34%]">Title</TableHead>
              <TableHead className="w-[22%]">Slug</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Last Updated</TableHead>
              <TableHead className={adminCellActions}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(initialPages.length === 0) && (!pages || pages.length === 0) ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                  No pages yet. Create your first page!
                </TableCell>
              </TableRow>
            ) : filteredPages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                  No pages found matching "{searchQuery}"
                </TableCell>
              </TableRow>
            ) : (
              filteredPages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className={`font-medium ${adminCellWrap}`}>
                    <span className="line-clamp-3" title={page.title}>
                      {page.title}
                    </span>
                  </TableCell>
                  <TableCell className={`text-gray-600 ${adminCellTruncate}`} title={page.slug}>
                    {page.slug}
                  </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          page.published
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {page.published ? "Published" : "Draft"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className={adminCellActions}>
                      <div className="flex justify-end gap-2">
                        <Link href={`/${page.slug}`} target="_blank">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/pages/${page.id}`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setPageToDelete(page)
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
            <DialogTitle>Delete Page</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{pageToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setPageToDelete(null)
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

