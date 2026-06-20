import {
  ALUMNI_COURSE_PROGRAMS,
  ALUMNI_DEPARTMENTS,
  ALUMNI_GENDERS,
  ALUMNI_OCCUPATIONS,
} from "@/lib/alumni-constants"

function str(fd: FormData, key: string): string {
  const v = fd.get(key)
  return typeof v === "string" ? v.trim() : ""
}

function bool(fd: FormData, key: string): boolean {
  const v = fd.get(key)
  if (v === null || v === undefined) return false
  if (typeof v === "string") {
    const s = v.toLowerCase()
    return s === "true" || s === "on" || s === "1" || s === "yes"
  }
  return false
}

function intField(raw: string, label: string): { ok: true; value: number } | { ok: false; error: string } {
  const trimmed = raw.trim()
  if (!trimmed) return { ok: false, error: `${label} is required` }
  const n = Number.parseInt(trimmed, 10)
  if (!Number.isFinite(n) || String(n) !== trimmed) {
    return { ok: false, error: `${label} must be a whole number` }
  }
  if (n < 1900 || n > 2100) {
    return { ok: false, error: `${label} must be between 1900 and 2100` }
  }
  return { ok: true, value: n }
}

export type ParsedAlumniRegistration = {
  fullName: string
  gender: string
  dateOfBirth: Date
  profilePhoto: string | null
  email: string
  mobileNumber: string
  alternatePhone: string | null
  currentAddress: string
  cityStateCountry: string
  courseProgram: string
  department: string
  yearOfAdmission: number
  yearOfGraduation: number
  enrollmentRollNumber: string
  currentOccupation: string
  companyOrganizationName: string | null
  jobTitle: string | null
  workLocation: string | null
  yearsOfExperience: string | null
  linkedInProfile: string | null
  socialMedia: string | null
  personalWebsite: string | null
  willingToMentor: boolean
  interestedInEvents: boolean
  areasOfInterest: string | null
  achievementsAwards: string | null
  suggestionsFeedback: string | null
  messageToInstitution: string | null
  declarationAccepted: boolean
}

export function parseAlumniRegistrationForm(
  fd: FormData,
  profilePhotoUrl: string | null
): { ok: true; data: ParsedAlumniRegistration } | { ok: false; error: string } {
  const fullName = str(fd, "fullName")
  if (!fullName) return { ok: false, error: "Full name is required" }

  const gender = str(fd, "gender")
  if (!ALUMNI_GENDERS.includes(gender as (typeof ALUMNI_GENDERS)[number])) {
    return { ok: false, error: "Please select a valid gender" }
  }

  const dobStr = str(fd, "dateOfBirth")
  if (!dobStr) return { ok: false, error: "Date of birth is required" }
  const dateOfBirth = new Date(dobStr + "T12:00:00")
  if (Number.isNaN(dateOfBirth.getTime())) {
    return { ok: false, error: "Invalid date of birth" }
  }

  const email = str(fd, "email")
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "A valid email address is required" }
  }

  const mobileNumber = str(fd, "mobileNumber")
  if (!mobileNumber || mobileNumber.length < 8) {
    return { ok: false, error: "Mobile number is required" }
  }

  const alternatePhone = str(fd, "alternatePhone") || null
  const currentAddress = str(fd, "currentAddress")
  if (!currentAddress) return { ok: false, error: "Current address is required" }

  const cityStateCountry = str(fd, "cityStateCountry")
  if (!cityStateCountry) return { ok: false, error: "City / State / Country is required" }

  const courseProgram = str(fd, "courseProgram")
  if (!ALUMNI_COURSE_PROGRAMS.includes(courseProgram as (typeof ALUMNI_COURSE_PROGRAMS)[number])) {
    return { ok: false, error: "Please select a valid course / program" }
  }

  const department = str(fd, "department")
  if (!ALUMNI_DEPARTMENTS.includes(department as (typeof ALUMNI_DEPARTMENTS)[number])) {
    return { ok: false, error: "Please select a valid department" }
  }

  const yAdm = intField(str(fd, "yearOfAdmission"), "Year of admission")
  if (!yAdm.ok) return yAdm
  const yGrad = intField(str(fd, "yearOfGraduation"), "Year of graduation / passing year")
  if (!yGrad.ok) return yGrad
  if (yGrad.value < yAdm.value) {
    return { ok: false, error: "Graduation year cannot be before year of admission" }
  }

  const enrollmentRollNumber = str(fd, "enrollmentRollNumber")
  if (!enrollmentRollNumber) return { ok: false, error: "Enrollment / roll number is required" }

  const currentOccupation = str(fd, "currentOccupation")
  if (!ALUMNI_OCCUPATIONS.includes(currentOccupation as (typeof ALUMNI_OCCUPATIONS)[number])) {
    return { ok: false, error: "Please select current occupation" }
  }

  const companyOrganizationName = str(fd, "companyOrganizationName") || null
  const jobTitle = str(fd, "jobTitle") || null
  const workLocation = str(fd, "workLocation") || null
  const yearsOfExperience = str(fd, "yearsOfExperience") || null

  const linkedInProfile = str(fd, "linkedInProfile") || null
  const socialMedia = str(fd, "socialMedia") || null
  const personalWebsite = str(fd, "personalWebsite") || null

  const willingToMentor = bool(fd, "willingToMentor")
  const interestedInEvents = bool(fd, "interestedInEvents")

  const areasOfInterest = str(fd, "areasOfInterest") || null
  const achievementsAwards = str(fd, "achievementsAwards") || null
  const suggestionsFeedback = str(fd, "suggestionsFeedback") || null
  const messageToInstitution = str(fd, "messageToInstitution") || null

  const declarationAccepted = bool(fd, "declarationAccepted")
  if (!declarationAccepted) {
    return { ok: false, error: "You must confirm that the information is correct" }
  }

  return {
    ok: true,
    data: {
      fullName,
      gender,
      dateOfBirth,
      profilePhoto: profilePhotoUrl,
      email,
      mobileNumber,
      alternatePhone,
      currentAddress,
      cityStateCountry,
      courseProgram,
      department,
      yearOfAdmission: yAdm.value,
      yearOfGraduation: yGrad.value,
      enrollmentRollNumber,
      currentOccupation,
      companyOrganizationName,
      jobTitle,
      workLocation,
      yearsOfExperience,
      linkedInProfile,
      socialMedia,
      personalWebsite,
      willingToMentor,
      interestedInEvents,
      areasOfInterest,
      achievementsAwards,
      suggestionsFeedback,
      messageToInstitution,
      declarationAccepted,
    },
  }
}
