/** Allowed values for alumni registration (must match server validation). */

export const ALUMNI_COURSE_PROGRAMS = ["B.A.", "B.Sc.", "B.Com"] as const

export const ALUMNI_DEPARTMENTS = [
  "ECONOMICS",
  "BOTANY",
  "CHEMISTRY",
  "COMMERCE",
  "GEOGRAPHY",
  "ENGLISH",
  "GARO",
  "EDUCATION",
  "ZOOLOGY",
  "HISTORY",
  "MATHEMATICS",
  "PHILOSOPHY",
  "PHYSICS",
  "POLITICAL SCIENCE",
  "SOCIOLOGY",
] as const

export const ALUMNI_GENDERS = ["Male", "Female", "Other"] as const

export const ALUMNI_OCCUPATIONS = ["Student", "Employed", "Business", "Other"] as const

export type AlumniCourseProgram = (typeof ALUMNI_COURSE_PROGRAMS)[number]
export type AlumniDepartment = (typeof ALUMNI_DEPARTMENTS)[number]
