"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pencil, Search } from "lucide-react"
import { DeleteCourseButton } from "@/components/admin/short-term-courses/DeleteCourseButton"

interface Course {
  id: string
  title: string
  code: string | null
  description: string | null
  image: string | null
  duration: string | null
  fees: string | null
  displayOrder: number
  published: boolean
}

export default function ShortTermCoursesList({ initialCourses }: { initialCourses: Course[] }) {
  const [courses, setCourses] = useState(initialCourses || [])
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCourses = useMemo(() => {
    if (!courses || courses.length === 0) {
      return []
    }
    
    if (!searchQuery.trim()) {
      return courses
    }

    const query = searchQuery.toLowerCase().trim()
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.code?.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query)
    )
  }, [courses, searchQuery])

  return (
    <>
      {/* Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm shadow-slate-900/5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900">Search courses</div>
            <div className="mt-1 text-xs text-slate-500">
              Search by title, code, or description
            </div>
          </div>
          {courses && courses.length > 0 ? (
            <div
              className={cn(
                "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ring-1",
                searchQuery
                  ? "bg-blue-50 text-blue-700 ring-blue-100"
                  : "bg-slate-50 text-slate-700 ring-slate-200"
              )}
            >
              {searchQuery ? (
                <>
                  {filteredCourses.length} match{filteredCourses.length !== 1 ? "es" : ""}
                </>
              ) : (
                <>
                  {courses.length} course{courses.length !== 1 ? "s" : ""}
                </>
              )}
            </div>
          ) : null}
        </div>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Type to search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 rounded-xl border-slate-200 bg-white pl-10 focus-visible:ring-blue-600/20"
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
        <Table>
          <TableHeader className="bg-slate-50/70">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Title
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Code
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Duration
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Status
              </TableHead>
              <TableHead className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
            <TableBody>
              {!courses || courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    No courses yet. Create your first course!
                  </TableCell>
                </TableRow>
              ) : filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    No courses found matching "{searchQuery}"
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((course) => (
                  <TableRow key={course.id} className="hover:bg-slate-50/60">
                    <TableCell className="px-4 py-4 font-semibold text-slate-900">
                      {course.title}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-slate-600">
                      {course.code ? (
                        <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                          {course.code}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-slate-600">
                      {course.duration || <span className="text-slate-400">—</span>}
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                          course.published
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                            : "bg-slate-50 text-slate-700 ring-slate-200"
                        )}
                      >
                        {course.published ? "Published" : "Draft"}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/short-term-courses/${course.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl hover:bg-slate-100"
                            aria-label={`Edit ${course.title}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteCourseButton courseId={course.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
        </Table>
      </div>
    </>
  )
}

