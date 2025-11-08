"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, FileText } from "lucide-react"

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

export default function QuestionPaperBrowser({ initialPapers }: { initialPapers: QuestionPaper[] }) {
  const defaultYear = useMemo(() => {
    if (!initialPapers || initialPapers.length === 0) {
      return YEARS[YEARS.length - 1]
    }
    return initialPapers.reduce((max, paper) => (paper.year > max ? paper.year : max), YEARS[0])
  }, [initialPapers])

  const [selectedYear, setSelectedYear] = useState<number>(defaultYear)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)

  const filteredDepartments = useMemo(() => {
    const departmentsForYear = initialPapers
      .filter((paper) => paper.year === selectedYear)
      .map((paper) => paper.department)

    return DEPARTMENTS.filter((dept) => departmentsForYear.includes(dept))
  }, [initialPapers, selectedYear])

  const selectedPapers = useMemo(() => {
    if (!selectedDepartment) return []
    return initialPapers.filter(
      (paper) => paper.year === selectedYear && paper.department === selectedDepartment
    )
  }, [initialPapers, selectedYear, selectedDepartment])

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-indigo-900">Select Year</h2>
        <div className="flex flex-wrap gap-3">
          {YEARS.map((year) => {
            const available = initialPapers.some((paper) => paper.year === year)
            return (
              <Button
                key={year}
                variant={selectedYear === year ? "default" : "outline"}
                disabled={!available}
                onClick={() => {
                  if (available) {
                    setSelectedYear(year)
                    setSelectedDepartment(null)
                  }
                }}
                className={cn(
                  "min-w-[4.5rem]",
                  selectedYear === year
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : available
                    ? "border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    : "border-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                {year}
              </Button>
            )
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-indigo-900">Select Department</h2>
        {filteredDepartments.length === 0 ? (
          <p className="text-sm text-gray-500">
            No question papers available for {selectedYear}. Please choose a different year.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredDepartments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-medium transition-all border",
                  selectedDepartment === dept
                    ? "bg-indigo-600 text-white border-indigo-600 shadow"
                    : "bg-white/80 border-indigo-100 text-indigo-700 hover:bg-indigo-50"
                )}
              >
                {dept}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-indigo-900">Question Papers</h2>
        {!selectedDepartment ? (
          <p className="text-sm text-gray-500">Select a department to view question papers.</p>
        ) : selectedPapers.length === 0 ? (
          <p className="text-sm text-gray-500">
            No question papers found for {selectedDepartment} ({selectedYear}).
          </p>
        ) : (
          <div className="grid gap-4">
            {selectedPapers.map((paper) => (
              <Card key={paper.id} className="border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
                  <div className="flex items-start gap-4">
                    <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-indigo-900 break-all">{paper.originalName}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Uploaded on {new Date(paper.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                      <a href={paper.fileUrl} target="_blank" rel="noopener noreferrer">
                        View / Download
                        <Download className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

