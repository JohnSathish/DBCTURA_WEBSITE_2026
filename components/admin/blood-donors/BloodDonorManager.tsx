"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { Download, Eye, RefreshCw, Trash2 } from "lucide-react"

import { BLOOD_GROUPS } from "@/lib/validation/blood-donor"
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

type Donor = {
  id: string
  fullName: string
  dateOfBirth: string
  gender?: string | null
  phone: string
  email: string
  bloodGroup: string
  lastDonationDate?: string | null
  addressStreet?: string | null
  addressCity?: string | null
  addressState?: string | null
  addressPostalCode?: string | null
  medicalNotes?: string | null
  preferredContact: string
  createdAt: string
}

export default function BloodDonorManager() {
  const [donors, setDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const loadDonors = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (bloodGroupFilter !== "all") params.append("bloodGroup", bloodGroupFilter)
      if (appliedSearch.trim()) params.append("search", appliedSearch.trim())

      const response = await fetch(`/api/blood-donors?${params.toString()}`, { cache: "no-store" })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || "Failed to load donors")
      }

      setDonors(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error("Error loading donors:", err)
      setError(err.message || "Failed to load donors")
      setDonors([])
    } finally {
      setLoading(false)
    }
  }, [bloodGroupFilter, appliedSearch])

  useEffect(() => {
    void loadDonors()
  }, [loadDonors])

  const formattedDonors = useMemo(
    () =>
      donors.map((donor) => ({
        ...donor,
        createdAtFormatted: new Date(donor.createdAt).toLocaleString(),
        age: (() => {
          const dob = new Date(donor.dateOfBirth)
          if (Number.isNaN(dob.getTime())) return "—"
          const diff = Date.now() - dob.getTime()
          return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
        })(),
        lastDonationFormatted: donor.lastDonationDate ? format(new Date(donor.lastDonationDate), "PPP") : "—",
      })),
    [donors]
  )

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAppliedSearch(searchTerm)
  }

  const handleReset = () => {
    setBloodGroupFilter("all")
    setSearchTerm("")
    setAppliedSearch("")
  }

  const handleView = (donor: Donor) => {
    setSelectedDonor(donor)
    setDetailOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this donor record? This cannot be undone.")) return

    try {
      const response = await fetch(`/api/blood-donors/${id}`, {
        method: "DELETE",
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete donor")
      }
      setDonors((prev) => prev.filter((donor) => donor.id !== id))
    } catch (err: any) {
      console.error("Failed to delete donor:", err)
      window.alert(err.message || "Failed to delete donor")
    }
  }

  const handleExport = () => {
    if (formattedDonors.length === 0) {
      window.alert("No donor records to export.")
      return
    }
    const headers = [
      "ID",
      "Full Name",
      "Age",
      "Gender",
      "Blood Group",
      "Phone",
      "Email",
      "Preferred Contact",
      "Last Donation",
      "City",
      "State",
      "Pincode",
      "Submitted",
    ]
    const rows = formattedDonors.map((donor) => [
      donor.id,
      donor.fullName,
      donor.age,
      donor.gender ?? "",
      donor.bloodGroup,
      donor.phone,
      donor.email,
      donor.preferredContact,
      donor.lastDonationFormatted,
      donor.addressCity ?? "",
      donor.addressState ?? "",
      donor.addressPostalCode ?? "",
      donor.createdAtFormatted,
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\r\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `blood-donors-${Date.now()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Blood Donor Registrations</h1>
        <p className="text-slate-600">
          View and manage donors registered through the public blood donor form.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <form className="grid gap-4 md:grid-cols-3 items-end" onSubmit={handleSearchSubmit}>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="search">
              Search donors
            </label>
            <Input
              id="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, email, phone, or city"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Blood group</label>
            <Select value={bloodGroupFilter} onValueChange={setBloodGroupFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All groups</SelectItem>
                {BLOOD_GROUPS.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 md:col-span-3">
            <Button type="submit" className="flex-1 md:flex-none md:min-w-[8rem]">
              Apply
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex-1 md:flex-none md:min-w-[8rem]"
            >
              Reset
            </Button>
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">{loading ? "…" : formattedDonors.length}</span>{" "}
            {formattedDonors.length === 1 ? "record" : "records"}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => loadDonors()} disabled={loading}>
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
          <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <Table>
            <TableHeader className="bg-slate-100/70">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>City</TableHead>
                <TableHead className="w-40 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                    Loading donor records…
                  </TableCell>
                </TableRow>
              ) : formattedDonors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                    No donors found for the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                formattedDonors.map((donor) => (
                  <TableRow key={donor.id}>
                    <TableCell className="font-medium text-slate-900">
                      {donor.fullName}
                      <span className="block text-xs text-slate-500">Registered {donor.createdAtFormatted}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{donor.bloodGroup}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">{donor.phone}</TableCell>
                    <TableCell className="text-slate-600">{donor.email}</TableCell>
                    <TableCell className="text-slate-600">{donor.addressCity ?? "—"}</TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => handleView(donor)}>
                        <Eye className="mr-1.5 h-4 w-4" />
                        View
                      </Button>
                      <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(donor.id)}>
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
        <DialogContent className="max-w-2xl">
          {selectedDonor ? (
            <>
              <DialogHeader>
                <DialogTitle>Donor details</DialogTitle>
                <DialogDescription>
                  Registered on {new Date(selectedDonor.createdAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoBlock label="Full name" value={selectedDonor.fullName} />
                  <InfoBlock label="Blood group" value={selectedDonor.bloodGroup} />
                  <InfoBlock label="Phone" value={selectedDonor.phone} />
                  <InfoBlock label="Email" value={selectedDonor.email} />
                  <InfoBlock label="Preferred contact" value={selectedDonor.preferredContact} />
                  <InfoBlock label="Gender" value={selectedDonor.gender ?? "Not provided"} />
                  <InfoBlock
                    label="Date of birth"
                    value={format(new Date(selectedDonor.dateOfBirth), "PPP")}
                  />
                  <InfoBlock label="Last donation" value={selectedDonor.lastDonationDate ? format(new Date(selectedDonor.lastDonationDate), "PPP") : "Not provided"} />
                </div>
                <InfoBlock
                  label="Address"
                  value={
                    [selectedDonor.addressStreet, selectedDonor.addressCity, selectedDonor.addressState, selectedDonor.addressPostalCode]
                      .filter(Boolean)
                      .join(", ") || "Not provided"
                  }
                />
                <div>
                  <p className="text-xs uppercase text-slate-500">Medical notes</p>
                  <div className="mt-2 rounded-lg border border-slate-200 bg-brand-surface/70 p-3 text-sm text-slate-700">
                    {selectedDonor.medicalNotes || "None"}
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

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  )
}


