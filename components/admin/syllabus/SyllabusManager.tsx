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
  getAcademicYears,
  DEPARTMENTS,
  PROGRAMMES,
  SEMESTERS,
} from "@/lib/academics-constants"
import { adminCellActions, adminCellClamp, adminCellWrap } from "@/components/admin/admin-table-classes"
import PdfDropzone from "@/components/admin/syllabus/PdfDropzone"
import {
  Download,
  Eye,
  Pencil,
  Trash2,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
} from "lucide-react"

export type SyllabusRecord = {
  id: string
  department: string
  programme: string
  academicYear: string
  curriculumVersion?: string | null
  semester: number
  courseCode: string
  courseName: string
  description?: string | null
  fileUrl: string
  originalName: string
  fileSize?: number | null
  published: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

const emptyForm = {
  department: DEPARTMENTS[0],
  programme: PROGRAMMES[0],
  academicYear: getAcademicYears()[0],
  curriculumVersion: "",
  semester: 1,
  courseCode: "",
  courseName: "",
  description: "",
  published: false,
  displayOrder: 0,
}

export default function SyllabusManager() {
  const [items, setItems] = useState<SyllabusRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [filterDepartment, setFilterDepartment] = useState<string>("all")
  const [filterProgramme, setFilterProgramme] = useState<string>("all")
  const [filterSemester, setFilterSemester] = useState<string>("all")
  const [filterYear, setFilterYear] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const [form, setForm] = useState({ ...emptyForm })
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const [editItem, setEditItem] = useState<SyllabusRecord | null>(null)
  const [editForm, setEditForm] = useState({ ...emptyForm })
  const [editPdf, setEditPdf] = useState<File | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)

  const [bulkExcel, setBulkExcel] = useState<File | null>(null)
  const [bulkPdfs, setBulkPdfs] = useState<File[]>([])
  const [bulkImporting, setBulkImporting] = useState(false)
  const [bulkResult, setBulkResult] = useState<{ created: number; skipped: number; errors: string[] } | null>(null)

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ includeDrafts: "1" })
      if (filterDepartment !== "all") params.set("department", filterDepartment)
      if (filterProgramme !== "all") params.set("programme", filterProgramme)
      if (filterSemester !== "all") params.set("semester", filterSemester)
      if (filterYear !== "all") params.set("academicYear", filterYear)
      if (filterStatus !== "all") params.set("status", filterStatus)
      if (search.trim()) params.set("search", search.trim())

      const res = await fetch(`/api/syllabus?${params}`)
      if (!res.ok) throw new Error((await res.json()).error || "Failed to load")
      setItems(await res.json())
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load syllabus")
    } finally {
      setLoading(false)
    }
  }, [filterDepartment, filterProgramme, filterSemester, filterYear, filterStatus, search])

  useEffect(() => {
    const t = setTimeout(loadItems, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [loadItems, search])

  const stats = useMemo(() => {
    const published = items.filter((i) => i.published).length
    return { total: items.length, published, draft: items.length - published }
  }, [items])

  const notify = (msg: string) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 4000)
  }

  const uploadPdf = async (file: File, meta: typeof emptyForm) => {
    const fd = new FormData()
    fd.append("file", file)
    fd.append("department", meta.department)
    fd.append("programme", meta.programme)
    fd.append("academicYear", meta.academicYear)
    fd.append("courseCode", meta.courseCode)
    const res = await fetch("/api/uploads/syllabus", { method: "POST", body: fd })
    if (!res.ok) throw new Error((await res.json()).error || "Upload failed")
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
    try {
      const uploaded = await uploadPdf(pdfFile, form)
      const save = await fetch("/api/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          fileUrl: uploaded.fileUrl,
          originalName: uploaded.originalName,
          fileSize: uploaded.fileSize,
        }),
      })
      if (!save.ok) throw new Error((await save.json()).error || "Failed to save")
      setForm({ ...emptyForm })
      setPdfFile(null)
      notify("Syllabus uploaded successfully")
      await loadItems()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const openEdit = (item: SyllabusRecord) => {
    setEditItem(item)
    setEditForm({
      department: item.department,
      programme: item.programme,
      academicYear: item.academicYear,
      curriculumVersion: item.curriculumVersion || "",
      semester: item.semester,
      courseCode: item.courseCode,
      courseName: item.courseName,
      description: item.description || "",
      published: item.published,
      displayOrder: item.displayOrder,
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

      const res = await fetch(`/api/syllabus/${editItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, fileUrl, originalName, fileSize }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Update failed")
      setEditItem(null)
      notify("Syllabus updated")
      await loadItems()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed")
    } finally {
      setSavingEdit(false)
    }
  }

  const togglePublish = async (item: SyllabusRecord) => {
    const res = await fetch(`/api/syllabus/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !item.published }),
    })
    if (!res.ok) {
      alert((await res.json()).error || "Failed to update status")
      return
    }
    await loadItems()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this syllabus entry and its PDF?")) return
    const res = await fetch(`/api/syllabus/${id}`, { method: "DELETE" })
    if (!res.ok) {
      alert((await res.json()).error || "Delete failed")
      return
    }
    notify("Syllabus deleted")
    await loadItems()
  }

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bulkExcel) {
      setError("Select an Excel file")
      return
    }
    setBulkImporting(true)
    setBulkResult(null)
    setError(null)
    try {
      const fd = new FormData()
      fd.append("excel", bulkExcel)
      bulkPdfs.forEach((f) => fd.append("pdfs", f))
      const res = await fetch("/api/syllabus/bulk-import", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Import failed")
      setBulkResult(data)
      notify(`Imported ${data.created} syllabus entries`)
      await loadItems()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Import failed")
    } finally {
      setBulkImporting(false)
    }
  }

  return (
    <div className="admin-page space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Total documents</p>
            <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200/60 bg-emerald-50/30 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm text-emerald-700">Published</p>
            <p className="text-3xl font-bold text-emerald-800">{stats.published}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200/60 bg-amber-50/30 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-700">Draft</p>
            <p className="text-3xl font-bold text-amber-800">{stats.draft}</p>
          </CardContent>
        </Card>
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
          <TabsTrigger value="list">Syllabus List</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Syllabus PDF</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreate}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Field label="Department">
                    <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Programme">
                    <Select value={form.programme} onValueChange={(v) => setForm({ ...form, programme: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{PROGRAMMES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Semester">
                    <Select value={String(form.semester)} onValueChange={(v) => setForm({ ...form, semester: Number(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{SEMESTERS.map((s) => <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Academic Year">
                    <Select value={form.academicYear} onValueChange={(v) => setForm({ ...form, academicYear: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{getAcademicYears().map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Course Code">
                    <Input value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} placeholder="e.g. ENG101" required />
                  </Field>
                  <Field label="Course Name">
                    <Input value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} required />
                  </Field>
                  <Field label="Curriculum Version">
                    <Input value={form.curriculumVersion} onChange={(e) => setForm({ ...form, curriculumVersion: e.target.value })} placeholder="e.g. NEP 2020" />
                  </Field>
                  <Field label="Display Order">
                    <Input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
                  </Field>
                </div>
                <Field label="Description / Remarks">
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
                </Field>
                <PdfDropzone file={pdfFile} onFile={setPdfFile} disabled={uploading} />
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="pub-new" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
                  <Label htmlFor="pub-new">Publish immediately</Label>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={uploading}>
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "Uploading…" : "Save Syllabus"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Bulk Import (Excel + PDFs)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleBulkImport}>
                <p className="text-sm text-slate-600">
                  Excel columns: Department, Programme, Semester, Course Code, Course Name, Academic Year, Curriculum Version (optional), Description (optional), Status (Published/Draft). PDF files are matched by course code in the filename (e.g. <code className="rounded bg-slate-100 px-1">ENG101.pdf</code>).
                </p>
                <Field label="Excel file (.xlsx)">
                  <Input type="file" accept=".xlsx,.xls" onChange={(e) => setBulkExcel(e.target.files?.[0] ?? null)} required />
                </Field>
                <Field label="PDF files (multiple)">
                  <Input type="file" accept=".pdf,application/pdf" multiple onChange={(e) => setBulkPdfs(Array.from(e.target.files ?? []))} />
                  {bulkPdfs.length > 0 && <p className="text-xs text-slate-500">{bulkPdfs.length} PDF(s) selected</p>}
                </Field>
                {bulkResult && (
                  <div className="rounded-lg border bg-slate-50 p-4 text-sm">
                    <p>Created: {bulkResult.created} · Skipped: {bulkResult.skipped}</p>
                    {bulkResult.errors.length > 0 && (
                      <ul className="mt-2 max-h-40 list-disc overflow-y-auto pl-5 text-red-600">
                        {bulkResult.errors.slice(0, 20).map((err) => (
                          <li key={err}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                <Button type="submit" disabled={bulkImporting}>
                  {bulkImporting ? "Importing…" : "Run Bulk Import"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle>Syllabus Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="xl:col-span-2" />
                <FilterSelect label="Dept" value={filterDepartment} onChange={setFilterDepartment} options={DEPARTMENTS} />
                <FilterSelect label="Programme" value={filterProgramme} onChange={setFilterProgramme} options={[...PROGRAMMES]} />
                <FilterSelect label="Semester" value={filterSemester} onChange={setFilterSemester} options={SEMESTERS.map(String)} labels={SEMESTERS.map((s) => `Sem ${s}`)} />
                <FilterSelect label="Year" value={filterYear} onChange={setFilterYear} options={getAcademicYears()} />
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
                <p className="py-8 text-center text-sm text-slate-500">Loading syllabus…</p>
              ) : items.length === 0 ? (
                <div className="rounded-xl border border-dashed py-12 text-center text-sm text-slate-500">
                  No syllabus documents found. Upload your first PDF above.
                </div>
              ) : (
                <div className="admin-table-shell overflow-x-auto">
                  <Table className="admin-data-table table-fixed min-w-[900px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[12%]">Department</TableHead>
                        <TableHead className="w-[8%]">Programme</TableHead>
                        <TableHead className="w-[6%]">Sem</TableHead>
                        <TableHead className="w-[10%]">Code</TableHead>
                        <TableHead className="w-[18%]">Course</TableHead>
                        <TableHead className="w-[14%]">PDF</TableHead>
                        <TableHead className="w-[8%]">Status</TableHead>
                        <TableHead className="w-[10%]">Updated</TableHead>
                        <TableHead className={adminCellActions}>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className={adminCellWrap}>{item.department}</TableCell>
                          <TableCell>{item.programme}</TableCell>
                          <TableCell>{item.semester}</TableCell>
                          <TableCell className="font-mono text-xs">{item.courseCode}</TableCell>
                          <TableCell className={adminCellClamp}>
                            <span className="line-clamp-2" title={item.courseName}>{item.courseName}</span>
                          </TableCell>
                          <TableCell className={adminCellClamp}>
                            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="line-clamp-1 text-indigo-600 hover:underline" title={item.originalName}>
                              {item.originalName}
                            </a>
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.published ? "default" : "secondary"}>
                              {item.published ? "Published" : "Draft"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                            {new Date(item.updatedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className={adminCellActions}>
                            <div className="flex justify-end gap-1">
                              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" title="View"><Eye className="h-4 w-4" /></a>
                              </Button>
                              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                <a href={item.fileUrl} download title="Download"><Download className="h-4 w-4" /></a>
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)} title="Edit">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePublish(item)} title={item.published ? "Unpublish" : "Publish"}>
                                {item.published ? <XCircle className="h-4 w-4 text-amber-600" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(item.id)} title="Delete">
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
            <DialogTitle>Edit Syllabus</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <Field label="Course Code">
              <Input value={editForm.courseCode} onChange={(e) => setEditForm({ ...editForm, courseCode: e.target.value })} />
            </Field>
            <Field label="Course Name">
              <Input value={editForm.courseName} onChange={(e) => setEditForm({ ...editForm, courseName: e.target.value })} />
            </Field>
            <Field label="Description">
              <Textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2} />
            </Field>
            <PdfDropzone file={editPdf} onFile={setEditPdf} id="edit-syllabus-pdf" />
            <p className="text-xs text-slate-500">Leave PDF empty to keep the current file.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={savingEdit}>{savingEdit ? "Saving…" : "Save changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
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
  label?: string
  value: string
  onChange: (v: string) => void
  options: readonly string[]
  labels?: string[]
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        {options.map((opt, i) => (
          <SelectItem key={opt} value={opt}>{labels?.[i] ?? opt}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
