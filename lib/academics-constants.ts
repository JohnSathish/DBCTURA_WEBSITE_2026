export const DEPARTMENTS = [
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
] as const

export type Department = (typeof DEPARTMENTS)[number]

export const PROGRAMMES = ["B.A.", "B.Sc.", "B.Com"] as const

export type Programme = (typeof PROGRAMMES)[number]

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8] as const

export const EXAM_TYPES = [
  "Internal Assessment I",
  "Internal Assessment II",
  "Internal Assessment III",
  "End Semester",
  "Supplementary",
  "Improvement",
] as const

export type ExamType = (typeof EXAM_TYPES)[number]

export const EXAM_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const

/** Academic years like 2025-2026 — always includes current and future year automatically. */
export function getAcademicYears(startYear = 2014): string[] {
  const current = new Date().getFullYear()
  const years: string[] = []
  for (let end = current + 1; end >= startYear + 1; end--) {
    years.push(`${end - 1}-${end}`)
  }
  return years
}

/** Calendar years for exam year dropdown — no hardcoded maintenance. */
export function getCalendarYears(start = 2015): number[] {
  const current = new Date().getFullYear()
  const years: number[] = []
  for (let y = current + 1; y >= start; y--) {
    years.push(y)
  }
  return years
}

export function getCurrentCalendarYear(): number {
  return new Date().getFullYear()
}

export function getDefaultAcademicYear(): string {
  return getAcademicYears()[0]
}

export function slugifySegment(value: string): string {
  return value.replace(/\s+/g, "-").replace(/[^\w.-]+/g, "")
}

/** @deprecated Use getAcademicYears() for dynamic list */
export const ACADEMIC_YEARS = getAcademicYears()
