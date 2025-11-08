"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"

import { BLOOD_GROUPS, CONTACT_METHODS, GENDERS, BloodDonorFormValues, bloodDonorSchema } from "@/lib/validation/blood-donor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export default function BloodDonorForm() {
  const [submitting, setSubmitting] = useState(false)
  const [successInfo, setSuccessInfo] = useState<{ id: string; timestamp: string } | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), [])

  const form = useForm<BloodDonorFormValues>({
    resolver: zodResolver(bloodDonorSchema),
    defaultValues: {
      fullName: "",
      dateOfBirth: "",
      gender: "",
      phone: "",
      email: "",
      bloodGroup: "A+",
      lastDonationDate: "",
      addressStreet: "",
      addressCity: "",
      addressState: "",
      addressPostalCode: "",
      medicalNotes: "",
      consent: false,
      preferredContact: "email",
    },
    mode: "onBlur",
  })

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors },
  } = form

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true)
    setServerError(null)
    setSuccessInfo(null)

    try {
      const response = await fetch("/api/blood-donors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (data?.details) {
          Object.entries(data.details).forEach(([key, messages]) => {
            if (messages && Array.isArray(messages) && messages.length > 0) {
              form.setError(key as keyof BloodDonorFormValues, { message: messages[0] })
            }
          })
        }
        throw new Error(data.error || "Failed to submit registration. Please try again.")
      }

      setSuccessInfo({
        id: data.id,
        timestamp: new Date().toLocaleString(),
      })
      form.reset()
    } catch (error: any) {
      setServerError(error.message || "Something went wrong. Please try again later.")
    } finally {
      setSubmitting(false)
    }
  })

  const consentChecked = watch("consent")

  return (
    <div className="space-y-6">
      <form className="space-y-6" onSubmit={onSubmit} noValidate>
        <section className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="fullName">
              Full Name<span className="text-rose-500">*</span>
            </label>
            <Input
              id="fullName"
              aria-required
              aria-invalid={Boolean(errors.fullName)}
              placeholder="Enter your full name"
              {...register("fullName")}
            />
            {errors.fullName ? <p className="text-sm text-rose-600">{errors.fullName.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="dateOfBirth">
              Date of Birth<span className="text-rose-500">*</span>
            </label>
            <Input
              id="dateOfBirth"
              type="date"
              max={today}
              aria-required
              aria-invalid={Boolean(errors.dateOfBirth)}
              {...register("dateOfBirth")}
            />
            {errors.dateOfBirth ? <p className="text-sm text-rose-600">{errors.dateOfBirth.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Gender</label>
            <Select
              value={watch("gender") ?? "prefer-not"}
              onValueChange={(value) => setValue("gender", value === "prefer-not" ? "" : value)}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                {GENDERS.map((gender) => (
                  <SelectItem key={gender} value={gender}>
                    {gender}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="phone">
              Phone Number<span className="text-rose-500">*</span>
            </label>
            <Input
              id="phone"
              inputMode="tel"
              aria-required
              aria-invalid={Boolean(errors.phone)}
              placeholder="+91 9876543210"
              {...register("phone")}
            />
            {errors.phone ? <p className="text-sm text-rose-600">{errors.phone.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="email">
              Email<span className="text-rose-500">*</span>
            </label>
            <Input
              id="email"
              type="email"
              aria-required
              aria-invalid={Boolean(errors.email)}
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email ? <p className="text-sm text-rose-600">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Preferred Contact Method</label>
            <Select value={watch("preferredContact")} onValueChange={(value) => setValue("preferredContact", value as any)}>
              <SelectTrigger id="preferredContact">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method === "email" ? "Email" : "Phone"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.preferredContact ? (
              <p className="text-sm text-rose-600">{errors.preferredContact.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Blood Group<span className="text-rose-500">*</span></label>
            <Select value={watch("bloodGroup")} onValueChange={(value) => setValue("bloodGroup", value as any)}>
              <SelectTrigger id="bloodGroup" aria-required aria-invalid={Boolean(errors.bloodGroup)}>
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_GROUPS.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bloodGroup ? <p className="text-sm text-rose-600">{errors.bloodGroup.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="lastDonationDate">
              Last Donation Date
            </label>
            <Input
              id="lastDonationDate"
              type="date"
              max={today}
              aria-invalid={Boolean(errors.lastDonationDate)}
              {...register("lastDonationDate")}
            />
            {errors.lastDonationDate ? (
              <p className="text-sm text-rose-600">{errors.lastDonationDate.message}</p>
            ) : null}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="addressStreet">
              Street Address
            </label>
            <Input id="addressStreet" placeholder="House / Street" {...register("addressStreet")} />
            {errors.addressStreet ? <p className="text-sm text-rose-600">{errors.addressStreet.message}</p> : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="addressCity">
              City
            </label>
            <Input id="addressCity" placeholder="City" {...register("addressCity")} />
            {errors.addressCity ? <p className="text-sm text-rose-600">{errors.addressCity.message}</p> : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="addressState">
              State
            </label>
            <Input id="addressState" placeholder="State" {...register("addressState")} />
            {errors.addressState ? <p className="text-sm text-rose-600">{errors.addressState.message}</p> : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="addressPostalCode">
              Pincode
            </label>
            <Input id="addressPostalCode" inputMode="numeric" placeholder="Pincode" {...register("addressPostalCode")} />
            {errors.addressPostalCode ? (
              <p className="text-sm text-rose-600">{errors.addressPostalCode.message}</p>
            ) : null}
          </div>
        </section>

        <section className="space-y-2">
          <label className="text-sm font-semibold text-slate-700" htmlFor="medicalNotes">
            Medical Conditions / Notes
          </label>
          <Textarea
            id="medicalNotes"
            rows={4}
            placeholder="Mention any medical conditions or notes that may be helpful."
            {...register("medicalNotes")}
          />
          {errors.medicalNotes ? <p className="text-sm text-rose-600">{errors.medicalNotes.message}</p> : null}
        </section>

        <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <input
              id="consent"
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              {...register("consent")}
            />
            <label htmlFor="consent" className={cn("text-sm text-slate-700", errors.consent && "text-rose-600")}>
              I confirm I am eligible to donate blood.
            </label>
          </div>
          {errors.consent ? <p className="text-sm text-rose-600">{errors.consent.message}</p> : null}
          <p className="text-xs text-slate-500">
            By submitting this form you agree to be contacted when a matching blood donation request is identified.
          </p>
        </section>

        {serverError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{serverError}</div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="submit" size="lg" disabled={submitting || !consentChecked} className="min-w-[12rem]">
            {submitting ? "Submitting..." : "Submit Registration"}
          </Button>
          <p className="text-xs text-slate-500">
            We will contact you via {watch("preferredContact")} when your blood group is required.
          </p>
        </div>
      </form>

      {successInfo ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-5 shadow-sm">
          <h2 className="text-lg font-semibold text-emerald-900">Thank you for registering!</h2>
          <p className="text-sm text-emerald-700 mt-1">
            Your donor ID is <span className="font-mono font-semibold">{successInfo.id}</span>. Submitted on{" "}
            {successInfo.timestamp}.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => window.print()}>
              Print Confirmation
            </Button>
          </div>
        </div>
      ) : null}

    </div>
  )
}

