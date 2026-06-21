import {
  ACADEMIC_YEARS,
  DEPARTMENTS,
  PROGRAMMES,
  SEMESTERS,
  type Department,
  type Programme,
} from "@/lib/academics-constants"

export type SyllabusInput = {
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
  published?: boolean
  displayOrder?: number
}

export function validateSyllabusFields(body: Partial<SyllabusInput>): string | null {
  if (!body.department || !DEPARTMENTS.includes(body.department as Department)) {
    return "Invalid department"
  }
  if (!body.programme || !PROGRAMMES.includes(body.programme as Programme)) {
    return "Invalid programme"
  }
  if (!body.academicYear || !ACADEMIC_YEARS.includes(body.academicYear)) {
    return "Invalid academic year"
  }
  if (body.semester == null || !SEMESTERS.includes(body.semester as (typeof SEMESTERS)[number])) {
    return "Invalid semester"
  }
  if (!body.courseCode?.trim()) return "Course code is required"
  if (!body.courseName?.trim()) return "Course name is required"
  if (!body.fileUrl?.trim()) return "PDF file is required"
  if (!body.originalName?.trim()) return "Original file name is required"
  return null
}

export function normalizeCourseCode(code: string): string {
  return code.trim().toUpperCase()
}
