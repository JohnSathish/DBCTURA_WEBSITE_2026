"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useMemo, useRef, useState } from "react"
import {
  ArrowLeft,
  Clock,
  Home,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
  Building2,
  ExternalLink,
} from "lucide-react"

import { COLLEGE_CONTACT, CONTACT_DEPARTMENTS } from "@/lib/contact-info"

const ReCAPTCHA = dynamic(() => import("react-google-recaptcha"), { ssr: false })

type FormState = "idle" | "submitting" | "success" | "error"

export default function ContactView() {
  const recaptchaRef = useRef<{ getValue: () => string | null; reset: () => void } | null>(null)
  const [formState, setFormState] = useState<FormState>("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  const requireRecaptcha = Boolean(recaptchaSiteKey)

  const mapSrc = useMemo(
    () => `https://www.google.com/maps?q=${COLLEGE_CONTACT.mapQuery}&output=embed`,
    []
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage("")

    if (requireRecaptcha && !recaptchaRef.current?.getValue()) {
      setErrorMessage("Please complete the reCAPTCHA verification.")
      setFormState("error")
      return
    }

    setFormState("submitting")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone: phone || undefined,
          subject,
          message,
          recaptchaToken: recaptchaRef.current?.getValue() ?? undefined,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message")
      }

      setFormState("success")
      setFullName("")
      setEmail("")
      setPhone("")
      setSubject("")
      setMessage("")
      recaptchaRef.current?.reset()
    } catch (err: unknown) {
      setFormState("error")
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0c2340] via-[#1E3A8A] to-[#2563EB] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_0%,#000_60%,transparent_100%)]" />
        <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-amber-400/25 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
                Reach us anytime
              </div>
              <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
                Contact Us
              </h1>
              <p className="mt-3 text-base text-white/85 sm:text-lg">
                Connect with Don Bosco College, Tura — admissions, general enquiries, and campus
                support. We&apos;re here to help.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={`tel:${COLLEGE_CONTACT.phoneTel}`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur-md transition hover:bg-white/20"
                >
                  <Phone className="h-4 w-4 text-amber-300" aria-hidden />
                  {COLLEGE_CONTACT.phone}
                </a>
                <a
                  href={`mailto:${COLLEGE_CONTACT.principalEmail}`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur-md transition hover:bg-white/20"
                >
                  <Mail className="h-4 w-4 text-amber-300" aria-hidden />
                  Email us
                </a>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/20"
              >
                <Home className="h-4 w-4" aria-hidden />
                Home
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#1E3A8A] shadow-lg shadow-black/10 transition hover:bg-white/95"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Go Back
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        {/* Contact cards */}
        <div className="-mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article className="group rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#1e3a8a]/8 ring-1 ring-slate-200/60 backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-2xl">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] text-white shadow-lg">
              <MapPin className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="font-heading text-lg font-bold text-slate-900">Visit us</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{COLLEGE_CONTACT.fullAddress}</p>
            <p className="mt-2 text-xs font-medium text-slate-500">
              AISHE Code: {COLLEGE_CONTACT.aisheCode}
            </p>
          </article>

          <article className="group rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#1e3a8a]/8 ring-1 ring-slate-200/60 backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-2xl">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-lg">
              <Phone className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="font-heading text-lg font-bold text-slate-900">Call or WhatsApp</h2>
            <a
              href={`tel:${COLLEGE_CONTACT.phoneTel}`}
              className="mt-2 block text-sm font-semibold text-[#1E3A8A] hover:underline"
            >
              {COLLEGE_CONTACT.phone}
            </a>
            <a
              href={COLLEGE_CONTACT.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline"
            >
              Chat on WhatsApp
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </article>

          <article className="group rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#1e3a8a]/8 ring-1 ring-slate-200/60 backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-2xl sm:col-span-2 lg:col-span-1">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
              <Clock className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="font-heading text-lg font-bold text-slate-900">Office hours</h2>
            <ul className="mt-3 space-y-2">
              {COLLEGE_CONTACT.officeHours.map((row) => (
                <li key={row.label} className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-600">{row.label}</span>
                  <span className="font-medium text-slate-800">{row.value}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-[#1e3a8a]/8 ring-1 ring-slate-200/50">
              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5 sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E3A8A]/10 text-[#1E3A8A]">
                    <MessageSquare className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-bold text-slate-900">Send a message</h2>
                    <p className="text-sm text-slate-500">We typically respond within 1–2 working days.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
                {formState === "success" ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    Thank you! Your message has been sent. Our team will get back to you soon.
                  </div>
                ) : null}

                {formState === "error" && errorMessage ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                    {errorMessage}
                  </div>
                ) : null}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Full name *
                    </label>
                    <input
                      id="contact-name"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/20"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Email *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/20"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-phone" className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Phone
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/20"
                      placeholder="+91 …"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-subject" className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Subject *
                    </label>
                    <input
                      id="contact-subject"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/20"
                      placeholder="Admission enquiry, visit, etc."
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-message" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/20"
                    placeholder="How can we help you?"
                  />
                </div>

                {requireRecaptcha ? (
                  <div className="overflow-hidden rounded-xl">
                    <ReCAPTCHA
                      ref={recaptchaRef as any}
                      sitekey={recaptchaSiteKey}
                      onChange={() => setErrorMessage("")}
                    />
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={formState === "submitting"}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#1e3a8a]/30 transition hover:brightness-110 disabled:opacity-60 sm:w-auto"
                >
                  <Send className="h-4 w-4" aria-hidden />
                  {formState === "submitting" ? "Sending…" : "Send message"}
                </button>
              </form>
            </div>
          </div>

          {/* Departments + quick links */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg ring-1 ring-slate-200/50">
              <h2 className="font-heading text-lg font-bold text-slate-900">Departments</h2>
              <ul className="mt-4 space-y-4">
                {CONTACT_DEPARTMENTS.map((dept) => (
                  <li
                    key={dept.title}
                    className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-[#2563EB]/20 hover:bg-white"
                  >
                    <div className="flex items-start gap-3">
                      <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1E3A8A]" aria-hidden />
                      <div>
                        <p className="font-semibold text-slate-900">{dept.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">{dept.description}</p>
                        {"email" in dept && dept.email ? (
                          <a
                            href={`mailto:${dept.email}`}
                            className="mt-2 inline-block text-xs font-medium text-[#1E3A8A] hover:underline"
                          >
                            {dept.email}
                          </a>
                        ) : null}
                        {"href" in dept && dept.href ? (
                          <a
                            href={dept.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#1E3A8A] hover:underline"
                          >
                            Apply online
                            <ExternalLink className="h-3 w-3" aria-hidden />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-orange-50/50 p-6 shadow-md">
              <h2 className="font-heading text-lg font-bold text-slate-900">Need something else?</h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/student-services/grievance-cell/submit" className="font-medium text-[#1E3A8A] hover:underline">
                    Submit a grievance →
                  </Link>
                </li>
                <li>
                  <Link href="/student-services/women-cell/complaint" className="font-medium text-[#1E3A8A] hover:underline">
                    Women Cell — quick complaint →
                  </Link>
                </li>
                <li>
                  <Link href="/notice-board" className="font-medium text-[#1E3A8A] hover:underline">
                    Notice board →
                  </Link>
                </li>
                <li>
                  <Link href="/downloads" className="font-medium text-[#1E3A8A] hover:underline">
                    Downloads & prospectus →
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl ring-1 ring-slate-200/50">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-900">Find us on the map</h2>
              <p className="text-sm text-slate-500">{COLLEGE_CONTACT.shortAddress}</p>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${COLLEGE_CONTACT.mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-[#1E3A8A] transition hover:bg-white"
            >
              Open in Google Maps
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>
          <div className="relative aspect-[16/9] min-h-[280px] w-full bg-slate-100 sm:aspect-[21/9]">
            <iframe
              title="Don Bosco College, Tura location map"
              src={mapSrc}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  )
}
