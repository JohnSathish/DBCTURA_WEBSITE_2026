"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Download, Eye, RefreshCw, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const categories = ["Administrator", "Faculty", "Support Staff", "Student", "Others"] as const

type Grievance = {
  id: string
  category: string
  fullName: string
  email: string
  phone?: string | null
  message: string
  createdAt: string
}

export default function GrievanceManager() {
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [searchInput, setSearchInput] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const loadGrievances = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filterCategory !== "all") params.append("category", filterCategory)
      if (appliedSearch.trim()) params.append("search", appliedSearch.trim())

      const response = await fetch(`/api/grievances?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch grievances")
      }

      setGrievances(Array.isArray(data) ? data : data.grievances || [])
    } catch (err: any) {
      console.error("Error loading grievances:", err)
      setError(err.message || "Failed to load grievances")
      setGrievances([])
    } finally {
      setLoading(false)
    }
  }, [filterCategory, appliedSearch])

  useEffect(() => {
    void loadGrievances()
  }, [loadGrievances])

  const formattedGrievances = useMemo(
    () =>
      grievances.map((item) => ({
        ...item,
        createdAtFormatted: new Date(item.createdAt).toLocaleString(),
      })),
    [grievances]
  )

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAppliedSearch(searchInput.trim())
  }

  const handleResetFilters = () => {
    setFilterCategory("all")
    setSearchInput("")
    setAppliedSearch("")
  }

  const handleView = (grievance: Grievance) => {
    setSelectedGrievance(grievance)
    setDetailOpen(true)
  }

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to delete this grievance? This action cannot be undone.")
    if (!confirm) return

    try {
      const response = await fetch(`/api/grievances/${id}`, {
        method: "DELETE",
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete grievance")
      }

      setGrievances((prev) => prev.filter((item) => item.id !== id))
    } catch (err: any) {
      console.error("Failed to delete grievance:", err)
      window.alert(err.message || "Failed to delete grievance. Please try again.")
    }
  }

  const handleExport = () => {
    if (formattedGrievances.length === 0) {
      window.alert("There are no grievances to export.")
      return
    }

    const headers = ["Category", "Full Name", "Email", "Phone", "Message", "Submitted At"]
    const rows = formattedGrievances.map((item) => [
      item.category,
      item.fullName,
      item.email,
      item.phone ?? "",
      item.message.replace(/\r?\n/g, " "),
      item.createdAtFormatted,
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\r\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `grievances-${Date.now()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Grievance Submissions</h1>
        <p className="text-slate-600">
          Review, filter, and manage grievances submitted through the Women Cell complaint form.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <form className="grid gap-4 md:grid-cols-4 items-end" onSubmit={handleSearchSubmit}>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="search">
              Search (name, email, phone, or message)
            </label>
            <Input
              id="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Start typing to search…"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Category</label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Apply
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={handleResetFilters}>
              Reset
            </Button>
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {loading ? "…" : formattedGrievances.length}
            </span>{" "}
            {formattedGrievances.length === 1 ? "record" : "records"}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => loadGrievances()} disabled={loading}>
              <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button type="button" variant="secondary" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <Table>
            <TableHeader className="bg-slate-100/70">
              <TableRow>
                <TableHead className="w-36">Submitted</TableHead>
                <TableHead className="w-32">Category</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="w-40 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-slate-500">
                    Loading grievances…
                  </TableCell>
                </TableRow>
              ) : formattedGrievances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-slate-500">
                    No grievances found for the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                formattedGrievances.map((grievance) => (
                  <TableRow key={grievance.id}>
                    <TableCell>{grievance.createdAtFormatted}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{grievance.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{grievance.fullName}</TableCell>
                    <TableCell className="text-slate-600">{grievance.email}</TableCell>
                    <TableCell className="text-slate-600">{grievance.phone ?? "—"}</TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => handleView(grievance)}>
                        <Eye className="mr-1.5 h-4 w-4" />
                        View
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(grievance.id)}
                      >
                        <Trash2 className="mr-1.5 h-4 w-4" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-xl">
          {selectedGrievance ? (
            <>
              <DialogHeader>
                <DialogTitle>Grievance Details</DialogTitle>
                <DialogDescription>
                  Submitted on {new Date(selectedGrievance.createdAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase text-slate-500">Category</p>
                  <Badge className="mt-1 w-fit">{selectedGrievance.category}</Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase text-slate-500">Full Name</p>
                    <p className="mt-1 font-semibold text-slate-900">{selectedGrievance.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-500">Email</p>
                    <p className="mt-1 text-slate-700">
                      <a className="hover:underline" href={`mailto:${selectedGrievance.email}`}>
                        {selectedGrievance.email}
                      </a>
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Phone</p>
                  <p className="mt-1 text-slate-700">{selectedGrievance.phone ?? "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Message</p>
                  <div className="mt-2 whitespace-pre-line rounded-lg border border-slate-200 bg-brand-surface/70 p-4 text-sm text-slate-700">
                    {selectedGrievance.message}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}


