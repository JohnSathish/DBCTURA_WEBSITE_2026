"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Search, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export type CommitteeMemberView = {
  id: string
  slNo: number | null
  name: string
  role: string | null
  displayOrder: number
}

export type CommitteeView = {
  id: string
  name: string
  slug: string
  description: string | null
  displayOrder: number
  published: boolean
  members: CommitteeMemberView[]
}

export type ExOfficioView = {
  id: string
  name: string
  role: string
  displayOrder: number
}

type Props = {
  academicYear: string
  exOfficio: ExOfficioView[]
  committees: CommitteeView[]
}

function CommitteeCard({ committee, defaultOpen }: { committee: CommitteeView; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false)

  return (
    <Card className="overflow-hidden border border-brand-gold/25 bg-white/90 shadow-md transition-shadow hover:shadow-lg">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-brand-gold/5 sm:px-6"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold leading-snug text-brand-navy sm:text-lg">{committee.name}</h3>
            <Badge variant="secondary" className="bg-brand-gold/20 text-brand-text">
              {committee.members.length} member{committee.members.length === 1 ? "" : "s"}
            </Badge>
          </div>
          {!open && committee.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{committee.description}</p>
          ) : null}
        </div>
        <span className="mt-1 shrink-0 rounded-full border border-brand-gold/30 bg-brand-gold/10 p-1.5 text-brand-maroon">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {open ? (
        <CardContent className="space-y-5 border-t border-brand-gold/15 px-5 pb-6 pt-5 sm:px-6">
          {committee.description ? (
            <p className="text-sm leading-relaxed text-slate-700">{committee.description}</p>
          ) : null}

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-brand-navy hover:bg-brand-navy">
                  <TableHead className="w-16 text-center font-semibold text-white">Sl.</TableHead>
                  <TableHead className="font-semibold text-white">Name</TableHead>
                  <TableHead className="font-semibold text-white">Role / Designation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {committee.members.map((member, idx) => (
                  <TableRow
                    key={member.id}
                    className={cn(
                      "transition-colors hover:bg-brand-gold/10",
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/80"
                    )}
                  >
                    <TableCell className="text-center font-semibold text-brand-maroon">
                      {member.slNo ?? idx + 1}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">{member.name}</TableCell>
                    <TableCell className="text-slate-600">{member.role || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      ) : null}
    </Card>
  )
}

export default function CommitteesDisplay({ academicYear, exOfficio, committees }: Props) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return committees
    return committees.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.members.some(
          (m) => m.name.toLowerCase().includes(q) || (m.role?.toLowerCase().includes(q) ?? false)
        )
    )
  }, [committees, search])

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-brand-gold/30 bg-gradient-to-br from-brand-navy via-brand-navy to-brand-maroon p-6 text-white shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-brand-gold/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 left-10 h-32 w-32 rounded-full bg-brand-sun/10 blur-2xl" />
        <p className="text-sm font-medium uppercase tracking-widest text-brand-gold/90">Don Bosco College, Tura</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Committees</h1>
        <p className="mt-2 text-brand-gold/95">Academic Year {academicYear}</p>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/85 sm:text-base">
          Institutional committees for academic governance, quality assurance, student welfare, and campus
          development — constituted for the current academic session.
        </p>
      </div>

      {exOfficio.length > 0 ? (
        <Card className="border-2 border-brand-gold/25 shadow-lg">
          <CardHeader className="rounded-t-xl bg-brand-gold/15 pb-4">
            <CardTitle className="flex items-center gap-2 text-xl text-brand-navy">
              <Users className="h-5 w-5 text-brand-maroon" />
              Ex-officio Members
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto pt-5">
            <Table>
              <TableHeader>
                <TableRow className="bg-brand-gold/10 hover:bg-brand-gold/10">
                  <TableHead className="w-16 text-center font-semibold text-brand-text">Sl.</TableHead>
                  <TableHead className="font-semibold text-brand-text">Name</TableHead>
                  <TableHead className="font-semibold text-brand-text">Designation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exOfficio.map((member, idx) => (
                  <TableRow key={member.id} className="hover:bg-brand-gold/8">
                    <TableCell className="text-center font-semibold text-brand-maroon">{idx + 1}</TableCell>
                    <TableCell className="font-medium text-slate-800">{member.name}</TableCell>
                    <TableCell className="text-slate-700">{member.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-brand-navy">Committee List</h2>
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search committees or members..."
              className="border-brand-gold/30 bg-white pl-9 focus-visible:ring-brand-gold"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card className="border-dashed border-slate-300 bg-slate-50/80">
            <CardContent className="py-12 text-center text-slate-600">
              {search ? "No committees match your search." : "Committee information will be published here soon."}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((committee, idx) => (
              <CommitteeCard key={committee.id} committee={committee} defaultOpen={idx === 0 && !search} />
            ))}
          </div>
        )}

        {search && filtered.length > 0 ? (
          <p className="text-center text-sm text-slate-500">
            Showing {filtered.length} of {committees.length} committees
          </p>
        ) : null}
      </div>
    </div>
  )
}
