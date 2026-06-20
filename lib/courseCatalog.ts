export const COURSE_CATALOG = {
  CAFA: "Certificate Course in A Chik Folk Arts",
  BCCS: "Basic Course on Computer Skills",
  ELPC: "English Language Proficiency Course",
  BCCH: "Basic Course in Computer Hardware",
  BCTE: "Basic Course in Tally",
} as const

export type CourseCode = keyof typeof COURSE_CATALOG

export function isCourseCode(value: string): value is CourseCode {
  return Object.prototype.hasOwnProperty.call(COURSE_CATALOG, value)
}

