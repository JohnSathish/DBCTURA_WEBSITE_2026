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

/** Treat empty / missing form values as undefined — avoids z.coerce.number() NaN errors */
function toOptionalNumber(val: unknown): number | undefined {
  if (val === "" || val === null || val === undefined) return undefined
  const n = typeof val === "number" ? val : Number(val)
  return Number.isFinite(n) ? n : undefined
}

function optionalNumber(min: number, max?: number) {
  let schema = z.number().min(min)
  if (max != null) schema = schema.max(max)
  return z.preprocess(toOptionalNumber, schema.optional())
}

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
  cuetScore: optionalNumber(0),
  cgpa: optionalNumber(0, 10),
  percentage: optionalNumber(0, 100),
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
    cuetScore: optionalNumber(0),
    cgpa: optionalNumber(0, 10),
    percentage: optionalNumber(0, 100),
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

export function formatFyugValidationErrors(details?: {
  fieldErrors?: Record<string, string[]>
  formErrors?: string[]
}) {
  if (!details) return "Validation failed"
  const messages = [
    ...(details.formErrors ?? []),
    ...Object.values(details.fieldErrors ?? {}).flat(),
  ].filter(Boolean)
  return messages.length > 0 ? messages.join("; ") : "Validation failed"
}

export function parseFyugDraft(body: unknown) {
  return fyugDraftSchema.safeParse(body)
}

export function parseFyugSubmit(body: unknown) {
  return fyugSubmitSchema.safeParse(body)
}
