export const FYUG_ACADEMIC_SESSION = "2026-2027"
export const FYUG_APPLICATION_PREFIX = "FYUG26"
export const FYUG_PORTAL_PATH = "/admissions/fyug-2026"

export const FYUG_GENDERS = ["Male", "Female"] as const

export const FYUG_AFFILIATED_UNIVERSITIES = [
  { value: "NEHU", label: "North Eastern Hill University (NEHU), Shillong" },
  { value: "OTHER", label: "Other" },
] as const

export const FYUG_MAJOR_MINOR_SUBJECTS = [
  "English",
  "Garo",
  "Economics",
  "Political Science",
  "Education",
  "Sociology",
  "Geography",
  "Philosophy",
  "History",
  "Mathematics",
  "Botany",
  "Zoology",
  "Chemistry",
  "Physics",
  "Commerce",
] as const

export const FYUG_HONOURS_SUBJECTS = [
  "English",
  "Garo",
  "Economics",
  "Political Science",
  "Education",
  "Sociology",
  "History",
  "Mathematics",
  "Botany",
  "Zoology",
  "Chemistry",
  "Physics",
  "Commerce",
] as const

export const FYUG_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
] as const

export type FyugStatus = (typeof FYUG_STATUSES)[number]

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const

export const FYUG_BACK_PAPER_INELIGIBLE_MSG =
  "Applicants having back papers are not eligible for admission into the Fourth-Year Honours Programme."

export const FYUG_MAX_PHOTO_BYTES = 2 * 1024 * 1024
export const FYUG_MAX_SIGNATURE_BYTES = 512 * 1024
export const FYUG_ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"] as const
