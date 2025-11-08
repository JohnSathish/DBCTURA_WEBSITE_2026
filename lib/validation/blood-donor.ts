import { z } from "zod"

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const
export const GENDERS = ["Male", "Female", "Other", "Prefer not to say"] as const
export const CONTACT_METHODS = ["email", "phone"] as const

const phoneRegex = /^\+?[0-9\s-]{7,15}$/

export const bloodDonorSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required").max(120, "Name is too long"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    gender: z.string().optional(),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(phoneRegex, "Enter a valid phone number"),
    email: z.string().email("Enter a valid email address"),
    bloodGroup: z.enum(BLOOD_GROUPS, {
      errorMap: () => ({ message: "Select a valid blood group" }),
    }),
    lastDonationDate: z.string().optional().nullable(),
    addressStreet: z.string().max(200, "Street address is too long").optional().nullable(),
    addressCity: z.string().max(120, "City name is too long").optional().nullable(),
    addressState: z.string().max(120, "State name is too long").optional().nullable(),
    addressPostalCode: z.string().max(20, "Pincode is too long").optional().nullable(),
    medicalNotes: z.string().max(1000, "Notes are too long").optional().nullable(),
    consent: z.boolean(),
    preferredContact: z.enum(CONTACT_METHODS, {
      errorMap: () => ({ message: "Select a contact preference" }),
    }),
  })
  .superRefine((data, ctx) => {
    if (!data.consent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["consent"],
        message: "You must confirm your eligibility to donate blood",
      })
    }

    const dob = new Date(data.dateOfBirth)
    if (Number.isNaN(dob.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dateOfBirth"],
        message: "Enter a valid date of birth",
      })
    } else {
      const now = new Date()
      const minDob = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate())
      if (dob > minDob) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dateOfBirth"],
          message: "Donor must be at least 18 years old",
        })
      }
    }

    if (data.lastDonationDate) {
      const lastDonation = new Date(data.lastDonationDate)
      if (Number.isNaN(lastDonation.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["lastDonationDate"],
          message: "Enter a valid donation date",
        })
      } else if (lastDonation > new Date()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["lastDonationDate"],
          message: "Last donation date cannot be in the future",
        })
      }
    }
  })

export type BloodDonorFormValues = z.infer<typeof bloodDonorSchema>

export function sanitizeBloodDonorInput(values: BloodDonorFormValues) {
  return {
    fullName: values.fullName.trim(),
    dateOfBirth: new Date(values.dateOfBirth),
    gender: values.gender?.trim() || null,
    phone: values.phone.trim(),
    email: values.email.trim().toLowerCase(),
    bloodGroup: values.bloodGroup,
    lastDonationDate: values.lastDonationDate ? new Date(values.lastDonationDate) : null,
    addressStreet: values.addressStreet?.trim() || null,
    addressCity: values.addressCity?.trim() || null,
    addressState: values.addressState?.trim() || null,
    addressPostalCode: values.addressPostalCode?.trim() || null,
    medicalNotes: values.medicalNotes?.trim() || null,
    consent: Boolean(values.consent),
    preferredContact: values.preferredContact,
  }
}


