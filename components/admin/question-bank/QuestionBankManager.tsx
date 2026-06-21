"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DEPARTMENTS,
  EXAM_MONTHS,
  EXAM_TYPES,
  getAcademicYears,
  getCalendarYears,
  getCurrentCalendarYear,
  getDefaultAcademicYear,
  PROGRAMMES,
  SEMESTERS,
} from "@/lib/academics-constants"
import { adminCellActions, adminCellClamp, adminCellWrap } from "@/components/admin/admin-table-classes"
import PdfDropzone from "@/components/admin/syllabus/PdfDropzone"
import {
  Archive,
  Building2,
  Calendar,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Pencil,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react"

export type QuestionPaperRecord = {
  id: string
  academicYear: string
  department: string
  programme: string
  semester: number
  courseName: string
  courseCode: string
  examType: string
  examMonth?: string | null
  examYear: number
  description?: string | null
  fileUrl: string
  originalName: string
  fileSize?: number | null
  downloadCount: number
  published: boolean
  createdAt: string
  updatedAt: string
}

type Stats = {
  total: number
  currentYear: number
  departmentsCovered: number
  totalDownloads: number
}

type QuestionPaperForm = {
  academicYear: string
  department: string
  programme: string
  semester: number
  courseName: string
  courseCode: string
  examType: string
  examMonth: string
  examYear: number
  description: string
  published: boolean
}

const emptyForm: QuestionPaperForm = {
  academicYear: getDefaultAcademicYear(),
  department: DEPARTMENTS[0],
  programme: PROGRAMMES[0],
  semester: 1,
  courseName: "",
  courseCode: "",
  examType: EXAM_TYPES[3],
  examMonth: "",
  examYear: getCurrentCalendarYear(),
  description: "",
  published: false,
}

export default function QuestionBankManager() {
  const calendarYears = useMemo(() => getCalendarYears(), [])
  const academicYears = useMemo(() => getAcademicYears(), [])

  const [papers, setPapers] = useState<QuestionPaperRecord[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, currentYear: 0, departmentsCovered: 0, totalDownloads: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [search, setSearch] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [filterProgramme, setFilterProgramme] = useState("all")
  const [filterSemester, setFilterSemester] = useState("all")
  const [filterAcademicYear, setFilterAcademicYear] = useState("all")
  const [filterExamYear, setFilterExamYear] = useState("all")
  const [filterExamType, setFilterExamType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const [form, setForm] = useState<QuestionPaperForm>({ ...emptyForm })
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const [editItem, setEditItem] = useState<QuestionPaperRecord | null>(null)
  const [editForm, setEditForm] = useState<QuestionPaperForm>({ ...emptyForm })
  const [editPdf, setEditPdf] = useState<File | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)

  const notify = (msg: string) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 4000)
  }

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/question-papers/stats")
      if (res.ok) setStats(await res.json())
    } catch {
      /* optional */
    }
  }, [])

  const loadPapers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ includeDrafts: "1" })
      if (filterDepartment !== "all") params.set("department", filterDepartment)
      if (filterProgramme !== "all") params.set("programme", filterProgramme)
      if (filterSemester !== "all") params.set("semester", filterSemester)
      if (filterAcademicYear !== "all") params.set("academicYear", filterAcademicYear)
      if (filterExamYear !== "all") params.set("examYear", filterExamYear)
      if (filterExamType !== "all") params.set("examType", filterExamType)
      if (filterStatus !== "all") params.set("status", filterStatus)
      if (search.trim()) params.set("search", search.trim())

      const res = await fetch(`/api/question-papers?${params}`)
      if (!res.ok) throw new Error((await res.json()).error || "Failed to load")
      setPapers(await res.json())
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load question papers")
    } finally {
      setLoading(false)
    }
  }, [
    filterDepartment,
    filterProgramme,
    filterSemester,
    filterAcademicYear,
    filterExamYear,
    filterExamType,
    filterStatus,
    search,
  ])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    const t = setTimeout(() => {
      loadPapers()
    }, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [loadPapers, search])

  const uploadPdf = async (file: File, meta: typeof emptyForm) => {
    setUploadProgress(20)
    const fd = new FormData()
    fd.append("file", file)
    fd.append("department", meta.department)
    fd.append("programme", meta.programme)
    fd.append("academicYear", meta.academicYear)
    fd.append("examYear", String(meta.examYear))
    fd.append("courseCode", meta.courseCode)
    const res = await fetch("/api/uploads/question-papers", { method: "POST", body: fd })
    setUploadProgress(70)
    if (!res.ok) throw new Error((await res.json()).error || "Upload failed")
    setUploadProgress(100)
    return res.json()
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!pdfFile) {
      setError("Please upload a PDF file")
      return
    }
    setUploading(true)
    setUploadProgress(0)
    try {
      const uploaded = await uploadPdf(pdfFile, form)
      const save = await fetch("/api/question-papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          fileUrl: uploaded.fileUrl,
          originalName: uploaded.originalName,
          fileType: uploaded.fileType,
          fileSize: uploaded.fileSize,
        }),
      })
      if (!save.ok) throw new Error((await save.json()).error || "Failed to save")
      setForm({ ...emptyForm, examYear: getCurrentCalendarYear(), academicYear: getDefaultAcademicYear() })
      setPdfFile(null)
      notify("Question paper uploaded successfully")
      await Promise.all([loadPapers(), loadStats()])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const openEdit = (item: QuestionPaperRecord) => {
    setEditItem(item)
    setEditForm({
      academicYear: item.academicYear,
      department: item.department,
      programme: item.programme,
      semester: item.semester,
      courseName: item.courseName,
      courseCode: item.courseCode,
      examType: item.examType,
      examMonth: item.examMonth || "",
      examYear: item.examYear,
      description: item.description || "",
      published: item.published,
    })
    setEditPdf(null)
  }

  const handleEditSave = async () => {
    if (!editItem) return
    setSavingEdit(true)
    setError(null)
    try {
      let fileUrl = editItem.fileUrl
      let originalName = editItem.originalName
      let fileSize = editItem.fileSize

      if (editPdf) {
        const uploaded = await uploadPdf(editPdf, editForm)
        fileUrl = uploaded.fileUrl
        originalName = uploaded.originalName
        fileSize = uploaded.fileSize
      }

      const res = await fetch(`/api/question-papers/${editItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, fileUrl, originalName, fileSize, fileType: "application/pdf" }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Update failed")
      setEditItem(null)
      notify("Question paper updated")
      await loadPapers()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed")
    } finally {
      setSavingEdit(false)
    }
  }

  const togglePublish = async (item: QuestionPaperRecord) => {
    const res = await fetch(`/api/question-papers/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !item.published }),
    })
    if (!res.ok) {
      alert((await res.json()).error || "Failed to update status")
      return
    }
    await loadPapers()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question paper and its PDF?")) return
    const res = await fetch(`/api/question-papers/${id}`, { method: "DELETE" })
    if (!res.ok) {
      alert((await res.json()).error || "Delete failed")
      return
    }
    notify("Question paper deleted")
    await Promise.all([loadPapers(), loadStats()])
  }

  const statCards = [
    { label: "Total Question Papers", value: stats.total, icon: Archive, className: "from-indigo-500 to-violet-600" },
    { label: "Current Year Papers", value: stats.currentYear, icon: Calendar, className: "from-sky-500 to-blue-600" },
    { label: "Departments Covered", value: stats.departmentsCovered, icon: Building2, className: "from-emerald-500 to-teal-600" },
    { label: "Total Downloads", value: stats.totalDownloads, icon: Download, className: "from-amber-500 to-orange-600" },
  ]

  return (
    <div className="admin-page space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, className }) => (
          <Card key={label} className="overflow-hidden border-slate-200 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-xl bg-gradient-to-br p-3 text-white shadow-sm ${className}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <XCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Question Papers</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b bg-gradient-to-r from-indigo-50/80 to-sky-50/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
                Upload Previous Year Question Paper
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-5" onSubmit={handleCreate}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Field label="Academic Year">
                    <Select value={form.academicYear} onValueChange={(v) => setForm({ ...form, academicYear: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {academicYears.map((y) => (
                          <SelectItem key={y} value={y}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Department">
                    <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Programme">
                    <Select value={form.programme} onValueChange={(v) => setForm({ ...form, programme: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PROGRAMMES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Semester">
                    <Select value={String(form.semester)} onValueChange={(v) => setForm({ ...form, semester: Number(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SEMESTERS.map((s) => <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Subject / Course Name">
                    <Input value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} required />
                  </Field>
                  <Field label="Course Code">
                    <Input value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} placeholder="e.g. ENG301" required />
                  </Field>
                  <Field label="Examination Type">
                    <Select value={form.examType} onValueChange={(v) => setForm({ ...form, examType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {EXAM_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Exam Month">
                    <Select value={form.examMonth || "none"} onValueChange={(v) => setForm({ ...form, examMonth: v === "none" ? "" : v })}>
                      <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Not specified</SelectItem>
                        {EXAM_MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Exam Year">
                    <Select value={String(form.examYear)} onValueChange={(v) => setForm({ ...form, examYear: Number(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {calendarYears.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label="Description / Notes">
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
                </Field>
                <PdfDropzone file={pdfFile} onFile={setPdfFile} disabled={uploading} id="qp-pdf" />
                {uploading && uploadProgress > 0 && (
                  <div className="space-y-1">
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-indigo-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="text-xs text-slate-500">Uploading… {uploadProgress}%</p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="qp-pub" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
                  <Label htmlFor="qp-pub">Publish immediately</Label>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={uploading} className="bg-indigo-600 hover:bg-indigo-700">
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "Uploading…" : "Upload Question Paper"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle>Previous Year Question Papers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-4 xl:grid-cols-8">
                <Input
                  placeholder="Search code, subject, dept…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="lg:col-span-2 xl:col-span-2"
                />
                <FilterSelect value={filterAcademicYear} onChange={setFilterAcademicYear} options={academicYears} />
                <FilterSelect value={filterExamYear} onChange={setFilterExamYear} options={calendarYears.map(String)} />
                <FilterSelect value={filterDepartment} onChange={setFilterDepartment} options={[...DEPARTMENTS]} />
                <FilterSelect value={filterProgramme} onChange={setFilterProgramme} options={[...PROGRAMMES]} />
                <FilterSelect value={filterSemester} onChange={setFilterSemester} options={SEMESTERS.map(String)} labels={SEMESTERS.map((s) => `Sem ${s}`)} />
                <FilterSelect value={filterExamType} onChange={setFilterExamType} options={[...EXAM_TYPES]} />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <p className="py-12 text-center text-sm text-slate-500">Loading question papers…</p>
              ) : papers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                  <p className="font-medium text-slate-600">No question papers found</p>
                  <p className="mt-1 text-sm text-slate-500">Upload your first previous year paper using the Upload tab.</p>
                </div>
              ) : (
                <div className="admin-table-shell overflow-x-auto">
                  <Table className="admin-data-table table-fixed min-w-[1100px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[9%]">Acad. Year</TableHead>
                        <TableHead className="w-[10%]">Department</TableHead>
                        <TableHead className="w-[7%]">Prog.</TableHead>
                        <TableHead className="w-[5%]">Sem</TableHead>
                        <TableHead className="w-[14%]">Subject</TableHead>
                        <TableHead className="w-[8%]">Code</TableHead>
                        <TableHead className="w-[12%]">Exam Type</TableHead>
                        <TableHead className="w-[12%]">File</TableHead>
                        <TableHead className="w-[7%]">Status</TableHead>
                        <TableHead className={adminCellActions}>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {papers.map((paper) => (
                        <TableRow key={paper.id} className="transition-colors hover:bg-slate-50/80">
                          <TableCell className="text-xs">{paper.academicYear}</TableCell>
                          <TableCell className={`text-xs ${adminCellWrap}`}>{paper.department}</TableCell>
                          <TableCell className="text-xs">{paper.programme}</TableCell>
                          <TableCell>{paper.semester}</TableCell>
                          <TableCell className={adminCellClamp}>
                            <span className="line-clamp-2 text-sm" title={paper.courseName}>{paper.courseName}</span>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{paper.courseCode}</TableCell>
                          <TableCell className={`text-xs ${adminCellClamp}`}>{paper.examType}</TableCell>
                          <TableCell className={adminCellClamp}>
                            <span className="line-clamp-1 text-xs text-indigo-600" title={paper.originalName}>{paper.originalName}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={paper.published ? "default" : "secondary"} className="text-[10px]">
                              {paper.published ? "Published" : "Draft"}
                            </Badge>
                          </TableCell>
                          <TableCell className={adminCellActions}>
                            <div className="flex justify-end gap-1">
                              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                <a href={paper.fileUrl} target="_blank" rel="noopener noreferrer" title="View"><Eye className="h-4 w-4" /></a>
                              </Button>
                              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                <a href={paper.fileUrl} download title="Download"><Download className="h-4 w-4" /></a>
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(paper)} title="Edit">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePublish(paper)} title={paper.published ? "Unpublish" : "Publish"}>
                                {paper.published ? <XCircle className="h-4 w-4 text-amber-600" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(paper.id)} title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Question Paper</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <Field label="Course Code">
              <Input value={editForm.courseCode} onChange={(e) => setEditForm({ ...editForm, courseCode: e.target.value })} />
            </Field>
            <Field label="Subject / Course Name">
              <Input value={editForm.courseName} onChange={(e) => setEditForm({ ...editForm, courseName: e.target.value })} />
            </Field>
            <Field label="Examination Type">
              <Select value={editForm.examType} onValueChange={(v) => setEditForm({ ...editForm, examType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXAM_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Description">
              <Textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2} />
            </Field>
            <PdfDropzone file={editPdf} onFile={setEditPdf} id="edit-qp-pdf" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={savingEdit}>{savingEdit ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      {children}
    </div>
  )
}

function FilterSelect({
  value,
  onChange,
  options,
  labels,
}: {
  value: string
  onChange: (v: string) => void
  options: readonly string[]
  labels?: string[]
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="text-xs"><SelectValue placeholder="All" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        {options.map((opt, i) => (
          <SelectItem key={opt} value={opt}>{labels?.[i] ?? opt}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
