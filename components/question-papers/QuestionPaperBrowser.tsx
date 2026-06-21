"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DEPARTMENTS,
  EXAM_TYPES,
  getAcademicYears,
  getCalendarYears,
  PROGRAMMES,
  SEMESTERS,
} from "@/lib/academics-constants"
import { Download, FileText, Search } from "lucide-react"

export type QuestionPaperPublic = {
  id: string
  academicYear: string
  department: string
  programme: string
  semester: number
  courseName: string
  courseCode: string
  examType: string
  examYear: number
  fileUrl: string
  originalName: string
}

export default function QuestionPaperBrowser({ papers }: { papers: QuestionPaperPublic[] }) {
  const academicYears = useMemo(() => getAcademicYears(), [])
  const calendarYears = useMemo(() => getCalendarYears(), [])

  const [search, setSearch] = useState("")
  const [academicYear, setAcademicYear] = useState<string>("")
  const [examYear, setExamYear] = useState<number | null>(null)
  const [department, setDepartment] = useState<string | null>(null)
  const [programme, setProgramme] = useState<string | null>(null)
  const [semester, setSemester] = useState<number | null>(null)
  const [examType, setExamType] = useState<string | null>(null)

  const availableAcademicYears = useMemo(() => {
    const set = new Set(papers.map((p) => p.academicYear))
    return academicYears.filter((y) => set.has(y))
  }, [papers, academicYears])

  const results = useMemo(() => {
    let list = [...papers]
    if (academicYear) list = list.filter((p) => p.academicYear === academicYear)
    if (examYear != null) list = list.filter((p) => p.examYear === examYear)
    if (department) list = list.filter((p) => p.department === department)
    if (programme) list = list.filter((p) => p.programme === programme)
    if (semester != null) list = list.filter((p) => p.semester === semester)
    if (examType) list = list.filter((p) => p.examType === examType)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.courseCode.toLowerCase().includes(q) ||
          p.courseName.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q)
      )
    }
    return list.sort((a, b) => b.examYear - a.examYear || a.courseCode.localeCompare(b.courseCode))
  }, [papers, academicYear, examYear, department, programme, semester, examType, search])

  const departmentsAvailable = useMemo(() => {
    return DEPARTMENTS.filter((d) => papers.some((p) => p.department === d))
  }, [papers])

  if (papers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-gold/30 bg-white/80 py-16 text-center">
        <FileText className="mx-auto mb-4 h-12 w-12 text-slate-300" />
        <p className="text-slate-600">Previous year question papers will appear here once published.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search course code, subject, department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <FilterSection title="Academic Year">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={!academicYear} onClick={() => setAcademicYear("")} label="All" />
          {availableAcademicYears.map((y) => (
            <FilterChip key={y} active={academicYear === y} onClick={() => setAcademicYear(y)} label={y} />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Exam Year">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={examYear === null} onClick={() => setExamYear(null)} label="All" />
          {calendarYears.filter((y) => papers.some((p) => p.examYear === y)).map((y) => (
            <FilterChip key={y} active={examYear === y} onClick={() => setExamYear(y)} label={String(y)} />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Department">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {departmentsAvailable.map((d) => (
            <FilterChip key={d} active={department === d} onClick={() => setDepartment(department === d ? null : d)} label={d} block />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Programme">
        <div className="flex flex-wrap gap-2">
          {PROGRAMMES.filter((p) => papers.some((x) => x.programme === p)).map((p) => (
            <FilterChip key={p} active={programme === p} onClick={() => setProgramme(programme === p ? null : p)} label={p} />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Semester">
        <div className="flex flex-wrap gap-2">
          {SEMESTERS.filter((s) => papers.some((p) => p.semester === s)).map((s) => (
            <FilterChip key={s} active={semester === s} onClick={() => setSemester(semester === s ? null : s)} label={`Sem ${s}`} />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Examination Type">
        <div className="flex flex-wrap gap-2">
          {EXAM_TYPES.filter((t) => papers.some((p) => p.examType === t)).map((t) => (
            <FilterChip key={t} active={examType === t} onClick={() => setExamType(examType === t ? null : t)} label={t} />
          ))}
        </div>
      </FilterSection>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-brand-text">
          {results.length} question paper{results.length !== 1 ? "s" : ""}
        </h2>
        {results.length === 0 ? (
          <p className="text-sm text-slate-500">No papers match your filters.</p>
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {results.map((paper) => (
              <li key={paper.id} className="flex flex-col gap-3 p-4 transition hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-brand-navy">{paper.courseCode}</p>
                    <p className="font-medium text-slate-900 break-words">{paper.courseName}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {paper.department} · {paper.programme} · Sem {paper.semester} · {paper.examType} · {paper.examYear}
                    </p>
                  </div>
                </div>
                <Button asChild className="shrink-0 bg-brand-navy hover:bg-brand-navy/90">
                  <a href={`/api/question-papers/${paper.id}/download`}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      {children}
    </section>
  )
}

function FilterChip({
  label,
  active,
  onClick,
  block,
}: {
  label: string
  active: boolean
  onClick: () => void
  block?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-3 py-2 text-sm font-medium transition",
        block && "text-left",
        active
          ? "border-brand-gold bg-brand-gold text-brand-text shadow-sm"
          : "border-slate-200 bg-white text-slate-700 hover:border-brand-hover/30 hover:bg-slate-50"
      )}
    >
      {label}
    </button>
  )
}
