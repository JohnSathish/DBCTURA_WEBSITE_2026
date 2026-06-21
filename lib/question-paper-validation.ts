import {
  DEPARTMENTS,
  EXAM_TYPES,
  getAcademicYears,
  getCalendarYears,
  PROGRAMMES,
  SEMESTERS,
  type Department,
  type ExamType,
  type Programme,
} from "@/lib/academics-constants"

export type QuestionPaperInput = {
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
  fileType?: string | null
  fileSize?: number | null
  published?: boolean
}

export function normalizeCourseCode(code: string): string {
  return code.trim().toUpperCase()
}

export function validateQuestionPaperFields(body: Partial<QuestionPaperInput>): string | null {
  const academicYears = getAcademicYears()
  const calendarYears = getCalendarYears()

  if (!body.academicYear || !academicYears.includes(body.academicYear)) {
    return "Invalid academic year"
  }
  if (!body.department || !DEPARTMENTS.includes(body.department as Department)) {
    return "Invalid department"
  }
  if (!body.programme || !PROGRAMMES.includes(body.programme as Programme)) {
    return "Invalid programme"
  }
  if (body.semester == null || !SEMESTERS.includes(body.semester as (typeof SEMESTERS)[number])) {
    return "Invalid semester"
  }
  if (!body.courseName?.trim()) return "Subject / course name is required"
  if (!body.courseCode?.trim()) return "Course code is required"
  if (!body.examType || !EXAM_TYPES.includes(body.examType as ExamType)) {
    return "Invalid examination type"
  }
  if (body.examYear == null || !calendarYears.includes(body.examYear)) {
    return "Invalid exam year"
  }
  if (!body.fileUrl?.trim()) return "PDF file is required"
  if (!body.originalName?.trim()) return "File name is required"
  return null
}
