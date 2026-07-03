import { z } from "zod"
import {
  FYUG_BACK_PAPER_INELIGIBLE_MSG,
  FYUG_GENDERS,
  FYUG_HONOURS_SUBJECTS,
  FYUG_MAJOR_MINOR_SUBJECTS,
  INDIAN_STATES,
} from "./fyug-admission-constants"

const mobileSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Mobile number must be 10 digits")

const optionalMobileSchema = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || /^[6-9]\d{9}$/.test(v), "Mobile number must be 10 digits")

export const fyugDraftSchema = z.object({
  id: z.string().optional(),
  draftToken: z.string().optional(),
  fullName: z.string().trim().optional(),
  gender: z.enum(FYUG_GENDERS).optional(),
  dob: z.string().optional(),
  mobile: optionalMobileSchema,
  whatsapp: optionalMobileSchema,
  email: z.string().trim().email().optional().or(z.literal("")),
  state: z.enum(INDIAN_STATES).optional(),
  photoUrl: z.string().optional(),
  fatherName: z.string().trim().optional(),
  fatherMobile: optionalMobileSchema,
  motherName: z.string().trim().optional(),
  motherMobile: optionalMobileSchema,
  collegeName: z.string().trim().optional(),
  affiliatedUniversity: z.enum(["NEHU", "OTHER"]).optional(),
  otherUniversityName: z.string().trim().optional(),
  majorSubject: z.enum(FYUG_MAJOR_MINOR_SUBJECTS).optional(),
  minorSubject: z.enum(FYUG_MAJOR_MINOR_SUBJECTS).optional(),
  honoursSubject: z.enum(FYUG_HONOURS_SUBJECTS).optional(),
  cuetScore: z.coerce.number().min(0).optional(),
  cgpa: z.coerce.number().min(0).max(10).optional(),
  percentage: z.coerce.number().min(0).max(100).optional(),
  hasBackPaper: z.boolean().optional(),
  backPaperDetails: z.string().trim().optional(),
  signatureUrl: z.string().optional(),
  signatureTypedName: z.string().trim().optional(),
  declarationAccepted: z.boolean().optional(),
})

export const fyugSubmitSchema = z
  .object({
    id: z.string().optional(),
    draftToken: z.string().optional(),
    fullName: z.string().trim().min(1, "Full name is required"),
    gender: z.enum(FYUG_GENDERS, { message: "Gender is required" }),
    dob: z.string().min(1, "Date of birth is required"),
    mobile: mobileSchema,
    whatsapp: optionalMobileSchema,
    email: z.string().trim().email("Valid email is required"),
    state: z.enum(INDIAN_STATES, { message: "State is required" }),
    photoUrl: z.string().min(1, "Applicant photograph is required"),
    fatherName: z.string().trim().min(1, "Father's name is required"),
    fatherMobile: mobileSchema,
    motherName: z.string().trim().min(1, "Mother's name is required"),
    motherMobile: mobileSchema,
    collegeName: z.string().trim().min(1, "College name is required"),
    affiliatedUniversity: z.enum(["NEHU", "OTHER"], {
      message: "Affiliated university is required",
    }),
    otherUniversityName: z.string().trim().optional(),
    majorSubject: z.enum(FYUG_MAJOR_MINOR_SUBJECTS, { message: "Major subject is required" }),
    minorSubject: z.enum(FYUG_MAJOR_MINOR_SUBJECTS, { message: "Minor subject is required" }),
    honoursSubject: z.enum(FYUG_HONOURS_SUBJECTS, {
      message: "Honours subject is required",
    }),
    cuetScore: z.coerce.number().min(0, "CUET score is required"),
    cgpa: z.coerce.number().min(0).max(10, "CGPA must be between 0 and 10"),
    percentage: z.coerce.number().min(0).max(100).optional(),
    hasBackPaper: z.boolean(),
    backPaperDetails: z.string().trim().optional(),
    signatureUrl: z.string().optional(),
    signatureTypedName: z.string().trim().optional(),
    declarationAccepted: z.literal(true, {
      message: "You must accept the declaration",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.affiliatedUniversity === "OTHER" && !data.otherUniversityName?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "University name is required when Other is selected",
        path: ["otherUniversityName"],
      })
    }
    if (data.hasBackPaper) {
      ctx.addIssue({
        code: "custom",
        message: FYUG_BACK_PAPER_INELIGIBLE_MSG,
        path: ["hasBackPaper"],
      })
    }
    if (!data.signatureUrl && !data.signatureTypedName?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Signature (draw or type name) is required",
        path: ["signatureUrl"],
      })
    }
  })

export type FyugDraftInput = z.infer<typeof fyugDraftSchema>
export type FyugSubmitInput = z.infer<typeof fyugSubmitSchema>

export function parseFyugDraft(body: unknown) {
  return fyugDraftSchema.safeParse(body)
}

export function parseFyugSubmit(body: unknown) {
  return fyugSubmitSchema.safeParse(body)
}
