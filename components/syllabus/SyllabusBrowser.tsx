"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, FileText, Search } from "lucide-react"
import { DEPARTMENTS, PROGRAMMES, SEMESTERS } from "@/lib/academics-constants"

export type SyllabusPublicItem = {
  id: string
  department: string
  programme: string
  academicYear: string
  semester: number
  courseCode: string
  courseName: string
  description?: string | null
  fileUrl: string
  originalName: string
}

export default function SyllabusBrowser({ items }: { items: SyllabusPublicItem[] }) {
  const academicYears = useMemo(() => {
    const set = new Set(items.map((i) => i.academicYear))
    return Array.from(set).sort().reverse()
  }, [items])

  const [academicYear, setAcademicYear] = useState(academicYears[0] ?? "")
  const [programme, setProgramme] = useState<string | null>(null)
  const [department, setDepartment] = useState<string | null>(null)
  const [semester, setSemester] = useState<number | null>(null)
  const [search, setSearch] = useState("")

  const programmesForYear = useMemo(() => {
    return PROGRAMMES.filter((p) =>
      items.some((i) => i.academicYear === academicYear && i.programme === p)
    )
  }, [items, academicYear])

  const departmentsForSelection = useMemo(() => {
    if (!programme) return []
    return DEPARTMENTS.filter((d) =>
      items.some(
        (i) => i.academicYear === academicYear && i.programme === programme && i.department === d
      )
    )
  }, [items, academicYear, programme])

  const semestersForSelection = useMemo(() => {
    if (!programme || !department) return []
    return SEMESTERS.filter((s) =>
      items.some(
        (i) =>
          i.academicYear === academicYear &&
          i.programme === programme &&
          i.department === department &&
          i.semester === s
      )
    )
  }, [items, academicYear, programme, department])

  const results = useMemo(() => {
    let list = items.filter((i) => i.academicYear === academicYear)
    if (programme) list = list.filter((i) => i.programme === programme)
    if (department) list = list.filter((i) => i.department === department)
    if (semester != null) list = list.filter((i) => i.semester === semester)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (i) =>
          i.courseCode.toLowerCase().includes(q) ||
          i.courseName.toLowerCase().includes(q) ||
          i.department.toLowerCase().includes(q)
      )
    }
    return list.sort((a, b) => a.courseCode.localeCompare(b.courseCode))
  }, [items, academicYear, programme, department, semester, search])

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-gold/30 bg-white/80 py-16 text-center">
        <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
        <p className="text-slate-600">Syllabus documents will appear here once published by the college.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search course code or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-brand-text">Academic Year</h2>
        <div className="flex flex-wrap gap-2">
          {academicYears.map((y) => (
            <Button
              key={y}
              type="button"
              variant={academicYear === y ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setAcademicYear(y)
                setProgramme(null)
                setDepartment(null)
                setSemester(null)
              }}
              className={academicYear === y ? "bg-brand-gold text-brand-text hover:opacity-95" : ""}
            >
              {y}
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-brand-text">Programme</h2>
        <div className="flex flex-wrap gap-2">
          {programmesForYear.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setProgramme(p)
                setDepartment(null)
                setSemester(null)
              }}
              className={cn(
                "rounded-xl border px-4 py-2 text-sm font-medium transition",
                programme === p
                  ? "border-brand-gold bg-brand-gold text-brand-text shadow-sm"
                  : "border-brand-hover/20 bg-white text-brand-hover hover:bg-brand-hover/5"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      {programme && (
        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold text-brand-text">Department</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {departmentsForSelection.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDepartment(d)
                  setSemester(null)
                }}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition",
                  department === d
                    ? "border-brand-gold bg-brand-gold/90 text-brand-text"
                    : "border-slate-200 bg-white hover:border-brand-hover/30"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </section>
      )}

      {department && (
        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold text-brand-text">Semester</h2>
          <div className="flex flex-wrap gap-2">
            {semestersForSelection.map((s) => (
              <Button
                key={s}
                type="button"
                variant={semester === s ? "default" : "outline"}
                size="sm"
                onClick={() => setSemester(s)}
                className={semester === s ? "bg-brand-navy text-white" : ""}
              >
                Semester {s}
              </Button>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-brand-text">
          {semester != null
            ? `Syllabus — ${programme} ${department}, Semester ${semester}`
            : "Select programme, department, and semester to view courses"}
        </h2>

        {semester != null && results.length === 0 ? (
          <p className="text-sm text-slate-500">No syllabus PDFs for this selection.</p>
        ) : semester != null ? (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {results.map((item) => (
              <li key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold text-brand-navy">{item.courseCode}</p>
                  <p className="font-medium text-slate-900 break-words">{item.courseName}</p>
                  {item.description ? (
                    <p className="mt-1 text-sm text-slate-500 line-clamp-2">{item.description}</p>
                  ) : null}
                </div>
                <Button asChild className="shrink-0 bg-brand-navy hover:bg-brand-navy/90">
                  <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" download>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  )
}
