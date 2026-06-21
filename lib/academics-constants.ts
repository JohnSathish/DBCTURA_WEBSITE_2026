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

export function getAcademicYears(start = 2018, end = 2030): string[] {
  const years: string[] = []
  for (let y = end; y >= start; y--) {
    years.push(`${y}-${y + 1}`)
  }
  return years
}

export const ACADEMIC_YEARS = getAcademicYears()

export function slugifySegment(value: string): string {
  return value.replace(/\s+/g, "-").replace(/[^\w.-]+/g, "")
}
