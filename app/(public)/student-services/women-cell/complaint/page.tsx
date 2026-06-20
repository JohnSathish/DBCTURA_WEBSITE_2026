"use client"

import dynamic from "next/dynamic"
import { ChangeEvent, FormEvent, useMemo, useState } from "react"

import { cn } from "@/lib/utils"

const categories = ["Administrator", "Faculty", "Support Staff", "Student", "Others"] as const
const ReCAPTCHA = dynamic(() => import("react-google-recaptcha"), { ssr: false })

type FormState = {
  category: (typeof categories)[number]
  fullName: string
  email: string
  phone: string
  message: string
}

const defaultState: FormState = {
  category: "Student",
  fullName: "",
  email: "",
  phone: "",
  message: "",
}

export default function ComplaintPage() {
  const [form, setForm] = useState<FormState>(defaultState)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  const requireRecaptcha = useMemo(() => Boolean(siteKey), [siteKey])

  const handleChange =
    (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (requireRecaptcha && !recaptchaToken) {
      setError("Please complete the reCAPTCHA verification.")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/grievances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          recaptchaToken: recaptchaToken ?? undefined,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit grievance. Please try again.")
      }

      setSuccess(true)
      setForm(defaultState)
      setRecaptchaToken(null)
    } catch (err: any) {
      setError(err.message || "Something went wrong while submitting your grievance.")
      setSuccess(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-surface py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Grievance Form</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Share your grievance with the Women Cell. Your submission will be reviewed confidentially and the response
            will be sent to the contact details you provide.
          </p>
        </header>

        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-yellow-100 p-6 sm:p-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <fieldset>
              <legend className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Category</legend>
              <div className="flex flex-wrap gap-4">
                {categories.map((category) => (
                  <label
                    key={category}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 border rounded-full cursor-pointer transition-all",
                      form.category === category
                        ? "border-yellow-400 bg-yellow-100 text-yellow-900 shadow-sm"
                        : "border-gray-200 hover:border-yellow-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={category}
                      checked={form.category === category}
                      onChange={() =>
                        setForm((prev) => ({
                          ...prev,
                          category,
                        }))
                      }
                      className="hidden"
                    />
                    <span className="text-sm font-medium">{category}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange("fullName")}
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange("phone")}
                  placeholder="Contact number"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-gray-700">
                Your Suggestion / Grievances
              </label>
              <textarea
                id="message"
                rows={5}
                value={form.message}
                onChange={handleChange("message")}
                placeholder="Describe your grievance in detail..."
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                required
              />
              <p className="text-xs text-gray-400">Provide at least 10 characters.</p>
            </div>

            {requireRecaptcha ? (
              <div className="flex justify-center">
                <ReCAPTCHA
                  sitekey={siteKey ?? ""}
                  onChange={(token) => setRecaptchaToken(token)}
                  onExpired={() => setRecaptchaToken(null)}
                />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-yellow-300 bg-yellow-50/60 p-4 text-sm text-yellow-800">
                <p className="font-medium">reCAPTCHA not configured</p>
                <p className="mt-1">Set NEXT_PUBLIC_RECAPTCHA_SITE_KEY and RECAPTCHA_SECRET_KEY to enable spam protection.</p>
              </div>
            )}

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            ) : null}

            {success ? (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                Thank you for sharing your grievance. We have received your submission.
              </div>
            ) : null}

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-yellow-500 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Submitting..." : "Submit Grievance"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

