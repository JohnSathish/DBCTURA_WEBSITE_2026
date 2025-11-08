"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, Trash2, Upload } from "lucide-react"

const YEARS = Array.from({ length: 2025 - 2015 + 1 }, (_, i) => 2015 + i)

const DEPARTMENTS = [
  "Botany",
  "Chemistry",
  "Commerce",
  "Economics",
  "Education",
  "English",
  "Garo",
  "Geography",
  "Environment",
  "History",
  "Mathematics",
  "Philosophy",
  "Physics",
  "Political Science",
  "Sociology",
  "Zoology",
]

type QuestionPaper = {
  id: string
  year: number
  department: string
  fileUrl: string
  originalName: string
  fileType?: string | null
  uploadedAt: string
}

export default function QuestionBankManager() {
  const [year, setYear] = useState<number>(2025)
  const [filterYear, setFilterYear] = useState<number | "all">("all")
  const [filterDepartment, setFilterDepartment] = useState<string | "all">("all")
  const [department, setDepartment] = useState<string>(DEPARTMENTS[0])
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)

  const loadQuestionPapers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterYear !== "all") {
        params.append("year", String(filterYear))
      }
      if (filterDepartment !== "all") {
        params.append("department", filterDepartment)
      }
      const response = await fetch(`/api/question-papers?${params.toString()}`)
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || "Failed to load question papers")
      }
      const data = await response.json()
      setQuestionPapers(data || [])
      setListError(null)
    } catch (err: any) {
      console.error(err)
      setListError(err.message || "Failed to load question papers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuestionPapers()
  }, [filterYear, filterDepartment])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setUploading(true)

    try {
      const uploadForm = new FormData()
      uploadForm.append("file", file)
      uploadForm.append("year", String(year))
      uploadForm.append("department", department)

      const uploadResponse = await fetch("/api/uploads/question-papers", {
        method: "POST",
        body: uploadForm,
      })

      if (!uploadResponse.ok) {
        const errData = await uploadResponse.json()
        throw new Error(errData.error || "Failed to upload file")
      }

      const uploadResult = await uploadResponse.json()

      const saveResponse = await fetch("/api/question-papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          department,
          fileUrl: uploadResult.fileUrl,
          originalName: uploadResult.originalName,
          fileType: uploadResult.fileType,
        }),
      })

      if (!saveResponse.ok) {
        const errData = await saveResponse.json()
        throw new Error(errData.error || "Failed to save question paper")
      }

      setFile(null)
      ;(document.getElementById("question-paper-file") as HTMLInputElement | null)?.value &&
        ((document.getElementById("question-paper-file") as HTMLInputElement).value = "")

      await loadQuestionPapers()
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to upload question paper")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question paper?")) return
    try {
      const response = await fetch(`/api/question-papers/${id}`, { method: "DELETE" })
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || "Failed to delete question paper")
      }
      await loadQuestionPapers()
    } catch (err: any) {
      alert(err.message || "Failed to delete question paper")
    }
  }

  const filteredPapers = useMemo(() => {
    return questionPapers
  }, [questionPapers])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Question Paper</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 lg:grid-cols-4 gap-4" onSubmit={handleUpload}>
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="question-paper-file">File (PDF or DOC)</Label>
              <Input
                id="question-paper-file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
              {file && <p className="text-xs text-gray-500">Selected: {file.name}</p>}
            </div>

            {error && (
              <div className="lg:col-span-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                {error}
              </div>
            )}

            <div className="lg:col-span-4 flex justify-end">
              <Button type="submit" disabled={uploading}>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Question Papers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Filter by Year</Label>
              <Select value={filterYear === "all" ? "all" : String(filterYear)} onValueChange={(value) => setFilterYear(value === "all" ? "all" : Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Filter by Department</Label>
              <Select value={filterDepartment === "all" ? "all" : filterDepartment} onValueChange={(value) => setFilterDepartment(value === "all" ? "all" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {listError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
              {listError}
            </div>
          )}

          {loading ? (
            <p className="text-sm text-gray-500">Loading question papers...</p>
          ) : filteredPapers.length === 0 ? (
            <p className="text-sm text-gray-500">No question papers found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Uploaded On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPapers.map((paper) => (
                    <TableRow key={paper.id}>
                      <TableCell>
                        <Badge variant="outline">{paper.year}</Badge>
                      </TableCell>
                      <TableCell>{paper.department}</TableCell>
                      <TableCell>
                        <a href={paper.fileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                          {paper.originalName}
                        </a>
                      </TableCell>
                      <TableCell>{new Date(paper.uploadedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="icon">
                            <a href={paper.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => handleDelete(paper.id)}>
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
    </div>
  )
}

