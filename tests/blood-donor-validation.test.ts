import { describe, expect, it } from "vitest"

import { bloodDonorSchema, sanitizeBloodDonorInput } from "@/lib/validation/blood-donor"

describe("bloodDonorSchema", () => {
  const baseData = {
    fullName: "John Doe",
    dateOfBirth: "1990-01-01",
    gender: "Male",
    phone: "+91 9876543210",
    email: "john@example.com",
    bloodGroup: "A+",
    lastDonationDate: "2024-01-01",
    addressStreet: "123 Street",
    addressCity: "Tura",
    addressState: "Meghalaya",
    addressPostalCode: "794001",
    medicalNotes: "Healthy",
    consent: true,
    preferredContact: "email" as const,
  }

  it("passes valid donor data", () => {
    const parsed = bloodDonorSchema.parse(baseData)
    expect(parsed.fullName).toBe("John Doe")
  })

  it("rejects underage donors", () => {
    const result = bloodDonorSchema.safeParse({
      ...baseData,
      dateOfBirth: new Date().toISOString().slice(0, 10),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.format().dateOfBirth?._errors?.[0]).toMatch(/at least 18/)
    }
  })

  it("rejects invalid phone numbers", () => {
    const result = bloodDonorSchema.safeParse({
      ...baseData,
      phone: "invalid",
    })
    expect(result.success).toBe(false)
  })

  it("rejects future donation date", () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const result = bloodDonorSchema.safeParse({
      ...baseData,
      lastDonationDate: tomorrow,
    })
    expect(result.success).toBe(false)
  })
})

describe("sanitizeBloodDonorInput", () => {
  it("trims and normalizes input", () => {
    const sanitized = sanitizeBloodDonorInput({
      fullName: "  Jane Doe ",
      dateOfBirth: "1995-05-05",
      gender: " Female ",
      phone: "  +91 9876543210 ",
      email: " TEST@EXAMPLE.COM ",
      bloodGroup: "O+",
      lastDonationDate: null,
      addressStreet: " Street ",
      addressCity: "",
      addressState: undefined,
      addressPostalCode: " 794001 ",
      medicalNotes: "  Notes ",
      consent: true,
      preferredContact: "email",
    })

    expect(sanitized.fullName).toBe("Jane Doe")
    expect(sanitized.email).toBe("test@example.com")
    expect(sanitized.addressCity).toBeNull()
    expect(sanitized.lastDonationDate).toBeNull()
  })
})

