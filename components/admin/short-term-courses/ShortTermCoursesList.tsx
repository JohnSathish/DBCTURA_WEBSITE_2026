"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Pencil, Trash2, Eye, Search } from "lucide-react"
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
      <div className="bg-white rounded-lg border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search courses by title, code, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {courses && courses.length > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            {searchQuery ? (
              <>Found {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""} matching "{searchQuery}"</>
            ) : (
              <>Total: {courses.length} course{courses.length !== 1 ? "s" : ""}</>
            )}
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!courses || courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No courses yet. Create your first course!
                  </TableCell>
                </TableRow>
              ) : filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No courses found matching "{searchQuery}"
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell className="text-gray-600">{course.code || "-"}</TableCell>
                    <TableCell className="text-gray-600">{course.duration || "-"}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.published
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {course.published ? "Published" : "Draft"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/short-term-courses/${course.id}`}>
                          <Button variant="ghost" size="icon">
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
      </div>
    </>
  )
}

