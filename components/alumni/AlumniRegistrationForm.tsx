"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ALUMNI_COURSE_PROGRAMS,
  ALUMNI_DEPARTMENTS,
  ALUMNI_GENDERS,
  ALUMNI_OCCUPATIONS,
} from "@/lib/alumni-constants"
import { Loader2 } from "lucide-react"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <h2 className="font-heading text-lg font-bold text-brand-text border-b border-brand-gold/40 pb-2 mb-4">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

export default function AlumniRegistrationForm() {
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null)
  const [course, setCourse] = useState("")
  const [department, setDepartment] = useState("")
  const [gender, setGender] = useState("")
  const [occupation, setOccupation] = useState("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setMessage(null)
    if (!gender || !course || !department || !occupation) {
      setMessage({ type: "err", text: "Please complete gender, course, department, and occupation." })
      return
    }
    setSubmitting(true)
    try {
      const fd = new FormData(form)
      fd.set("gender", gender)
      fd.set("courseProgram", course)
      fd.set("department", department)
      fd.set("currentOccupation", occupation)

      const res = await fetch("/api/alumni/registrations", {
        method: "POST",
        body: fd,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || "Submission failed")
      }
      setMessage({ type: "ok", text: "Thank you! Your alumni registration was submitted successfully." })
      form.reset()
      setCourse("")
      setDepartment("")
      setGender("")
      setOccupation("")
    } catch (err: any) {
      setMessage({ type: "err", text: err?.message || "Something went wrong. Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      encType="multipart/form-data"
      className="space-y-8"
    >
      {message ? (
        <div
          className={
            message.type === "ok"
              ? "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
              : "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          }
        >
          {message.text}
        </div>
      ) : null}

      <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
        <p className="font-semibold">Donations & registration fee</p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>
            Account for donations — <strong>SBI, Chandmari Branch – Tura</strong>, A/c No.{" "}
            <strong>32391795388</strong>
          </li>
          <li>
            <strong>Registration fee:</strong> Students — Rs. 50/-; Others — Rs. 100/-
          </li>
        </ul>
      </div>

      <Section title="Personal information">
        <div>
          <Label htmlFor="fullName">Full name *</Label>
          <Input id="fullName" name="fullName" required className="mt-1.5" placeholder="As per records" />
        </div>
        <div>
          <Label>Gender *</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {ALUMNI_GENDERS.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="dateOfBirth">Date of birth *</Label>
          <Input id="dateOfBirth" name="dateOfBirth" type="date" required className="mt-1.5 max-w-xs" />
        </div>
        <div>
          <Label htmlFor="profilePhoto">Profile photo (optional)</Label>
          <Input id="profilePhoto" name="profilePhoto" type="file" accept="image/*" className="mt-1.5" />
          <p className="text-xs text-slate-500 mt-1">JPG / PNG / WebP, up to 4 MB</p>
        </div>
      </Section>

      <Section title="Contact details">
        <div>
          <Label htmlFor="email">Email address *</Label>
          <Input id="email" name="email" type="email" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="mobileNumber">Mobile number *</Label>
          <Input id="mobileNumber" name="mobileNumber" type="tel" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="alternatePhone">Alternate phone (optional)</Label>
          <Input id="alternatePhone" name="alternatePhone" type="tel" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="currentAddress">Current address *</Label>
          <Textarea id="currentAddress" name="currentAddress" required rows={3} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="cityStateCountry">City / State / Country *</Label>
          <Input id="cityStateCountry" name="cityStateCountry" required className="mt-1.5" />
        </div>
      </Section>

      <Section title="Academic information">
        <div>
          <Label>Course / program *</Label>
          <Select value={course} onValueChange={setCourse}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              {ALUMNI_COURSE_PROGRAMS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Department *</Label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {ALUMNI_DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="yearOfAdmission">Year of admission *</Label>
            <Input id="yearOfAdmission" name="yearOfAdmission" type="number" required min={1900} max={2100} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="yearOfGraduation">Year of graduation / passing year *</Label>
            <Input id="yearOfGraduation" name="yearOfGraduation" type="number" required min={1900} max={2100} className="mt-1.5" />
          </div>
        </div>
        <div>
          <Label htmlFor="enrollmentRollNumber">Enrollment / roll number *</Label>
          <Input id="enrollmentRollNumber" name="enrollmentRollNumber" required className="mt-1.5" />
        </div>
      </Section>

      <Section title="Professional details">
        <div>
          <Label>Current occupation *</Label>
          <Select value={occupation} onValueChange={setOccupation}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {ALUMNI_OCCUPATIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="companyOrganizationName">Company / organization name</Label>
          <Input id="companyOrganizationName" name="companyOrganizationName" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="jobTitle">Job title / designation</Label>
          <Input id="jobTitle" name="jobTitle" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="workLocation">Work location</Label>
          <Input id="workLocation" name="workLocation" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="yearsOfExperience">Years of experience</Label>
          <Input id="yearsOfExperience" name="yearsOfExperience" className="mt-1.5" placeholder="e.g. 5" />
        </div>
      </Section>

      <Section title="Social & networking (optional)">
        <div>
          <Label htmlFor="linkedInProfile">LinkedIn profile</Label>
          <Input id="linkedInProfile" name="linkedInProfile" type="url" className="mt-1.5" placeholder="https://..." />
        </div>
        <div>
          <Label htmlFor="socialMedia">Facebook / Instagram</Label>
          <Input id="socialMedia" name="socialMedia" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="personalWebsite">Personal website / portfolio</Label>
          <Input id="personalWebsite" name="personalWebsite" type="url" className="mt-1.5" />
        </div>
      </Section>

      <Section title="Alumni engagement">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-800">Willing to mentor students? *</legend>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="willingToMentor" value="true" required className="h-4 w-4" />
              Yes
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="willingToMentor" value="false" className="h-4 w-4" />
              No
            </label>
          </div>
        </fieldset>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-800">Interested in alumni events? *</legend>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="interestedInEvents" value="true" required className="h-4 w-4" />
              Yes
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="interestedInEvents" value="false" className="h-4 w-4" />
              No
            </label>
          </div>
        </fieldset>
        <div>
          <Label htmlFor="areasOfInterest">Areas of interest (mentorship, guest lectures, donations, etc.)</Label>
          <Textarea id="areasOfInterest" name="areasOfInterest" rows={3} className="mt-1.5" />
        </div>
      </Section>

      <Section title="Additional information">
        <div>
          <Label htmlFor="achievementsAwards">Achievements / awards</Label>
          <Textarea id="achievementsAwards" name="achievementsAwards" rows={3} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="suggestionsFeedback">Suggestions / feedback</Label>
          <Textarea id="suggestionsFeedback" name="suggestionsFeedback" rows={3} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="messageToInstitution">Message to institution</Label>
          <Textarea id="messageToInstitution" name="messageToInstitution" rows={3} className="mt-1.5" />
        </div>
      </Section>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <label className="flex items-start gap-3 text-sm text-slate-800">
          <input
            type="checkbox"
            name="declarationAccepted"
            value="true"
            required
            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300"
          />
          <span>
            I confirm that the above information is correct. *
          </span>
        </label>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting} className="min-w-[200px] rounded-xl bg-[#1E3A8A] hover:bg-[#2563EB]">
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            "Submit registration"
          )}
        </Button>
      </div>
    </form>
  )
}
