"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Award,
  BookOpen,
  Calendar,
  FileWarning,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  PenLine,
  Phone,
  School,
  User,
  Users,
} from "lucide-react"
import {
  FYUG_AFFILIATED_UNIVERSITIES,
  FYUG_BACK_PAPER_INELIGIBLE_MSG,
  FYUG_HONOURS_SUBJECTS,
  FYUG_MAJOR_MINOR_SUBJECTS,
  INDIAN_STATES,
} from "@/lib/fyug-admission-constants"
import { formatFyugValidationErrors } from "@/lib/fyug-admission-validate"
import SignaturePad from "./SignaturePad"
import FyugPreviewModal from "./FyugPreviewModal"
import FyugPortalHeader from "./ui/FyugPortalHeader"
import FyugEligibilityNotice from "./ui/FyugEligibilityNotice"
import FyugTrackButton from "./ui/FyugTrackButton"
import FyugProgressStepper, { type FyugStepId } from "./ui/FyugProgressStepper"
import FyugSectionCard from "./ui/FyugSectionCard"
import FyugField from "./ui/FyugField"
import FyugGenderCards from "./ui/FyugGenderCards"
import FyugPhotoUpload from "./ui/FyugPhotoUpload"
import FyugSearchableSelect from "./ui/FyugSearchableSelect"
import FyugSegmentedControl from "./ui/FyugSegmentedControl"
import { cn } from "@/lib/utils"
import { FYUG_FIELD_GAP } from "./ui/fyug-theme"

const DRAFT_KEY = "fyug_admission_draft_token"
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const stateOptions = INDIAN_STATES.map((s) => ({ value: s, label: s }))
const subjectOptions = FYUG_MAJOR_MINOR_SUBJECTS.map((s) => ({ value: s, label: s }))
const honoursOptions = FYUG_HONOURS_SUBJECTS.map((s) => ({ value: s, label: s }))
const universityOptions = FYUG_AFFILIATED_UNIVERSITIES.map((u) => ({ value: u.value, label: u.label }))

async function uploadFile(file: File, kind: "photo" | "signature"): Promise<string> {
  const fd = new FormData()
  fd.set("file", file)
  fd.set("kind", kind)
  const res = await fetch("/api/uploads/fyug-admissions", { method: "POST", body: fd })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || "Upload failed")
  return data.url as string
}

async function uploadDataUrl(dataUrl: string, kind: "signature"): Promise<string> {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  const file = new File([blob], "signature.png", { type: "image/png" })
  return uploadFile(file, kind)
}

function isMobileValid(v: string) {
  return /^\d{10}$/.test(v)
}

export default function FyugAdmissionForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [recordId, setRecordId] = useState<string | undefined>()
  const [draftToken, setDraftToken] = useState<string | undefined>()
  const [activeStep, setActiveStep] = useState<FyugStepId>("personal")
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const [fullName, setFullName] = useState("")
  const [gender, setGender] = useState("")
  const [dob, setDob] = useState("")
  const [mobile, setMobile] = useState("")
  const [whatsappSame, setWhatsappSame] = useState(true)
  const [whatsapp, setWhatsapp] = useState("")
  const [email, setEmail] = useState("")
  const [state, setState] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [photoPreview, setPhotoPreview] = useState("")
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)

  const [fatherName, setFatherName] = useState("")
  const [fatherMobile, setFatherMobile] = useState("")
  const [motherName, setMotherName] = useState("")
  const [motherMobile, setMotherMobile] = useState("")

  const [collegeName, setCollegeName] = useState("")
  const [affiliatedUniversity, setAffiliatedUniversity] = useState("")
  const [otherUniversityName, setOtherUniversityName] = useState("")

  const [majorSubject, setMajorSubject] = useState("")
  const [minorSubject, setMinorSubject] = useState("")
  const [honoursSubject, setHonoursSubject] = useState("")
  const [cuetScore, setCuetScore] = useState("")
  const [cgpa, setCgpa] = useState("")
  const [percentage, setPercentage] = useState("")

  const [hasBackPaper, setHasBackPaper] = useState<boolean | null>(null)
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)
  const [signatureUrl, setSignatureUrl] = useState("")
  const [signatureTypedName, setSignatureTypedName] = useState("")
  const [useTypedSignature, setUseTypedSignature] = useState(false)
  const [declarationAccepted, setDeclarationAccepted] = useState(false)

  const sectionRefs = {
    personal: useRef<HTMLElement>(null),
    parents: useRef<HTMLElement>(null),
    college: useRef<HTMLElement>(null),
    academic: useRef<HTMLElement>(null),
    declaration: useRef<HTMLElement>(null),
  }

  const loadDraft = useCallback(async (token: string) => {
    try {
      const res = await fetch(`/api/fyug-admissions/draft/${token}`)
      if (!res.ok) return
      const d = await res.json()
      setRecordId(d.id)
      setDraftToken(d.draftToken)
      setFullName(d.fullName || "")
      setGender(d.gender || "")
      setDob(d.dob || "")
      setMobile(d.mobile || "")
      setWhatsapp(d.whatsapp || "")
      setWhatsappSame(d.whatsapp === d.mobile)
      setEmail(d.email || "")
      setState(d.state || "")
      setPhotoUrl(d.photoUrl || "")
      setPhotoPreview(d.photoUrl || "")
      setFatherName(d.fatherName || "")
      setFatherMobile(d.fatherMobile || "")
      setMotherName(d.motherName || "")
      setMotherMobile(d.motherMobile || "")
      setCollegeName(d.collegeName || "")
      setAffiliatedUniversity(d.affiliatedUniversity || "")
      setOtherUniversityName(d.otherUniversityName || "")
      setMajorSubject(d.majorSubject || "")
      setMinorSubject(d.minorSubject || "")
      setHonoursSubject(d.honoursSubject || "")
      setCuetScore(d.cuetScore != null ? String(d.cuetScore) : "")
      setCgpa(d.cgpa != null ? String(d.cgpa) : "")
      setPercentage(d.percentage != null ? String(d.percentage) : "")
      if (d.hasBackPaper === true) setHasBackPaper(true)
      else if (d.hasBackPaper === false && d.fullName) setHasBackPaper(false)
      setSignatureUrl(d.signatureUrl || "")
      setSignatureTypedName(d.signatureTypedName || "")
      setDeclarationAccepted(!!d.declarationAccepted)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    const q = searchParams.get("draft")
    const stored = typeof window !== "undefined" ? localStorage.getItem(DRAFT_KEY) : null
    const token = q || stored
    if (token) loadDraft(token)
  }, [searchParams, loadDraft])

  const completedSteps = useMemo(() => {
    const done = new Set<FyugStepId>()
    if (fullName && gender && dob && mobile && email && state && photoUrl) done.add("personal")
    if (fatherName && fatherMobile && motherName && motherMobile) done.add("parents")
    if (collegeName && affiliatedUniversity && (affiliatedUniversity !== "OTHER" || otherUniversityName))
      done.add("college")
    if (majorSubject && minorSubject && honoursSubject) done.add("academic")
    if (hasBackPaper === false && declarationAccepted) done.add("declaration")
    return done
  }, [
    fullName,
    gender,
    dob,
    mobile,
    email,
    state,
    photoUrl,
    fatherName,
    fatherMobile,
    motherName,
    motherMobile,
    collegeName,
    affiliatedUniversity,
    otherUniversityName,
    majorSubject,
    minorSubject,
    honoursSubject,
    cuetScore,
    cgpa,
    hasBackPaper,
    declarationAccepted,
  ])

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    const stepIds = Object.keys(sectionRefs) as FyugStepId[]

    stepIds.forEach((id) => {
      const el = sectionRefs[id].current
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveStep(id)
        },
        { rootMargin: "-20% 0px -55% 0px", threshold: 0 }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach((o) => o.disconnect())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function buildPayload(extra?: { signatureUrl?: string }) {
    return {
      id: recordId,
      draftToken,
      fullName: fullName.toUpperCase(),
      gender: gender || undefined,
      dob: dob || undefined,
      mobile: mobile || undefined,
      whatsapp: whatsappSame ? mobile : whatsapp || undefined,
      email: email || undefined,
      state: state || undefined,
      photoUrl: photoUrl || undefined,
      fatherName,
      fatherMobile,
      motherName,
      motherMobile,
      collegeName,
      affiliatedUniversity: affiliatedUniversity || undefined,
      otherUniversityName: affiliatedUniversity === "OTHER" ? otherUniversityName : undefined,
      majorSubject: majorSubject || undefined,
      minorSubject: minorSubject || undefined,
      honoursSubject: honoursSubject || undefined,
      cuetScore: cuetScore ? Number(cuetScore) : undefined,
      cgpa: cgpa ? Number(cgpa) : undefined,
      percentage: percentage ? Number(percentage) : undefined,
      hasBackPaper: hasBackPaper === true,
      signatureUrl: extra?.signatureUrl ?? (signatureUrl || undefined),
      signatureTypedName: useTypedSignature ? signatureTypedName : undefined,
      declarationAccepted,
    }
  }

  async function handlePhotoChange(file: File | null) {
    setPhotoFile(file)
    if (!file) {
      setPhotoUrl("")
      setPhotoPreview("")
      return
    }
    setMessage(null)
    setPhotoUploading(true)
    try {
      const url = await uploadFile(file, "photo")
      setPhotoUrl(url)
      setPhotoPreview(url)
    } catch (err: unknown) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Photo upload failed" })
      setPhotoFile(null)
    } finally {
      setPhotoUploading(false)
    }
  }

  const saveDraft = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      else setAutoSaving(true)
      if (!silent) setMessage(null)
      try {
        const res = await fetch("/api/fyug-admissions/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload()),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(formatFyugValidationErrors(data.details) || data.error || "Failed to save draft")
        setRecordId(data.id)
        setDraftToken(data.draftToken)
        localStorage.setItem(DRAFT_KEY, data.draftToken)
        if (!silent) {
          setMessage({ type: "ok", text: "Draft saved. You can return later to complete your application." })
        }
      } catch (err: unknown) {
        if (!silent) {
          setMessage({ type: "err", text: err instanceof Error ? err.message : "Save draft failed" })
        }
      } finally {
        if (!silent) setLoading(false)
        else setAutoSaving(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      recordId,
      draftToken,
      fullName,
      gender,
      dob,
      mobile,
      whatsappSame,
      whatsapp,
      email,
      state,
      photoUrl,
      fatherName,
      fatherMobile,
      motherName,
      motherMobile,
      collegeName,
      affiliatedUniversity,
      otherUniversityName,
      majorSubject,
      minorSubject,
      honoursSubject,
      cuetScore,
      cgpa,
      percentage,
      hasBackPaper,
      signatureUrl,
      useTypedSignature,
      signatureTypedName,
      declarationAccepted,
    ]
  )

  useEffect(() => {
    const interval = setInterval(() => {
      if (fullName || email || mobile) saveDraft(true)
    }, 30_000)
    return () => clearInterval(interval)
  }, [saveDraft, fullName, email, mobile])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (hasBackPaper === true) {
      setMessage({ type: "err", text: FYUG_BACK_PAPER_INELIGIBLE_MSG })
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      let finalSignatureUrl = signatureUrl
      if (!useTypedSignature && signatureDataUrl) {
        finalSignatureUrl = await uploadDataUrl(signatureDataUrl, "signature")
        setSignatureUrl(finalSignatureUrl)
      }

      const res = await fetch("/api/fyug-admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload({ signatureUrl: finalSignatureUrl })),
      })
      const data = await res.json()
      if (!res.ok) {
        const detail = formatFyugValidationErrors(data.details) || data.error
        throw new Error(detail || "Submission failed")
      }
      localStorage.removeItem(DRAFT_KEY)
      router.push(
        `/admissions/fyug-2026/success?no=${encodeURIComponent(data.applicationNo)}&id=${data.id}`
      )
    } catch (err: unknown) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Submission failed" })
    } finally {
      setLoading(false)
    }
  }

  function scrollToStep(id: FyugStepId) {
    sectionRefs[id].current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const emailError = touched.email && email && !EMAIL_RE.test(email) ? "Enter a valid email address" : undefined
  const mobileError = touched.mobile && mobile && !isMobileValid(mobile) ? "Enter a valid 10-digit mobile number" : undefined
  const ineligible = hasBackPaper === true

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-10 sm:px-6 md:px-[60px] md:py-[60px]">
      <FyugPortalHeader />

      <div className="space-y-6">
        <FyugEligibilityNotice />
        <FyugTrackButton />
      </div>

      <FyugProgressStepper
        activeStep={activeStep}
        completedSteps={completedSteps}
        onStepClick={scrollToStep}
      />

      <form onSubmit={handleSubmit} className="space-y-10">
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={cn(
                "rounded-xl px-5 py-4 text-sm font-medium shadow-sm",
                message.type === "ok"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border border-red-200 bg-red-50 text-red-800"
              )}
              role="status"
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {autoSaving && (
          <p className="text-center text-xs text-slate-400" aria-live="polite">
            Auto-saving draft…
          </p>
        )}

        <FyugSectionCard
          id="section-personal"
          ref={sectionRefs.personal}
          icon={User}
          title="Personal Information"
          subtitle="Basic details of the applicant"
          accent="blue"
        >
          <div className={FYUG_FIELD_GAP}>
            <FyugField
              label="Full Name (Block Letters)"
              icon={User}
              required
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value.toUpperCase())}
              className="uppercase"
              placeholder="JOHN WILLIAM SMITH"
            />

            <div className="grid gap-5 md:grid-cols-2">
              <div className="relative">
                <FyugPhotoUpload
                  value={photoFile}
                  previewUrl={photoPreview || null}
                  onChange={handlePhotoChange}
                  error={touched.photo && !photoUrl ? "Photograph is required" : undefined}
                />
                {photoUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70">
                    <Loader2 className="h-6 w-6 animate-spin text-[#2563EB]" />
                  </div>
                )}
              </div>
              <FyugGenderCards
                value={gender}
                onChange={setGender}
                error={touched.gender && !gender ? "Please select gender" : undefined}
              />
            </div>

            <FyugField
              label="Date of Birth"
              icon={Calendar}
              required
              type="date"
              name="dob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />

            <div className="grid gap-5 md:grid-cols-2">
              <FyugField
                label="Mobile Number"
                icon={Phone}
                required
                inputMode="numeric"
                maxLength={10}
                name="mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                onBlur={() => setTouched((t) => ({ ...t, mobile: true }))}
                error={mobileError}
                valid={isMobileValid(mobile)}
                placeholder="9876543210"
              />
              <div>
                <FyugField
                  label="WhatsApp Number"
                  icon={MessageCircle}
                  inputMode="numeric"
                  maxLength={10}
                  name="whatsapp"
                  value={whatsappSame ? mobile : whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  disabled={whatsappSame}
                  placeholder="9876543210"
                />
                <label className="mt-3 flex cursor-pointer items-center gap-2 text-[13px] text-slate-600">
                  <input
                    type="checkbox"
                    checked={whatsappSame}
                    onChange={(e) => setWhatsappSame(e.target.checked)}
                    className="h-4 w-4 rounded border-[#DCE3EC] text-[#2563EB] focus:ring-[#2563EB]/20"
                  />
                  Same as Mobile Number
                </label>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FyugField
                label="Email Address"
                icon={Mail}
                required
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                error={emailError}
                valid={!!email && EMAIL_RE.test(email)}
                placeholder="you@example.com"
              />
              <FyugSearchableSelect
                label="State"
                required
                value={state}
                onChange={setState}
                options={stateOptions}
                placeholder="Select state"
                icon={<MapPin className="h-[18px] w-[18px]" />}
              />
            </div>
          </div>
        </FyugSectionCard>

        <FyugSectionCard
          id="section-parents"
          ref={sectionRefs.parents}
          icon={Users}
          title="Parent Details"
          subtitle="Contact information of parents or guardians"
          accent="green"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <FyugField
              label="Father's Name"
              icon={User}
              required
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
            />
            <FyugField
              label="Father's Mobile"
              icon={Phone}
              required
              inputMode="numeric"
              maxLength={10}
              value={fatherMobile}
              onChange={(e) => setFatherMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
            />
            <FyugField
              label="Mother's Name"
              icon={User}
              required
              value={motherName}
              onChange={(e) => setMotherName(e.target.value)}
            />
            <FyugField
              label="Mother's Mobile"
              icon={Phone}
              required
              inputMode="numeric"
              maxLength={10}
              value={motherMobile}
              onChange={(e) => setMotherMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
            />
          </div>
        </FyugSectionCard>

        <FyugSectionCard
          id="section-college"
          ref={sectionRefs.college}
          icon={School}
          title="Previous College Details"
          subtitle="Institution where you completed Semester V"
          accent="violet"
        >
          <div className={FYUG_FIELD_GAP}>
            <FyugField
              label="Name of College Last Attended"
              icon={School}
              required
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
            />
            <FyugSearchableSelect
              label="Affiliated University"
              required
              value={affiliatedUniversity}
              onChange={setAffiliatedUniversity}
              options={universityOptions}
              searchable={false}
            />
            {affiliatedUniversity === "OTHER" && (
              <FyugField
                label="University Name"
                icon={GraduationCap}
                required
                value={otherUniversityName}
                onChange={(e) => setOtherUniversityName(e.target.value)}
              />
            )}
          </div>
        </FyugSectionCard>

        <FyugSectionCard
          id="section-academic"
          ref={sectionRefs.academic}
          icon={GraduationCap}
          title="Academic Information"
          subtitle="Courses studied and honours programme preference"
          accent="blue"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <FyugSearchableSelect
              label="MAJOR Course Studied in UG Programme"
              required
              value={majorSubject}
              onChange={setMajorSubject}
              options={subjectOptions}
              icon={<BookOpen className="h-[18px] w-[18px]" />}
            />
            <FyugSearchableSelect
              label="MINOR Course Studied in UG Programme"
              required
              value={minorSubject}
              onChange={setMinorSubject}
              options={subjectOptions}
              icon={<BookOpen className="h-[18px] w-[18px]" />}
            />
            <FyugSearchableSelect
              label="Applying for Fourth-Year Honours in"
              required
              value={honoursSubject}
              onChange={setHonoursSubject}
              options={honoursOptions}
              icon={<GraduationCap className="h-[18px] w-[18px]" />}
            />
            <FyugField
              label="CUET 2026 Score"
              icon={Award}
              helper="Optional"
              type="number"
              min={0}
              step="any"
              value={cuetScore}
              onChange={(e) => setCuetScore(e.target.value)}
            />
            <FyugField
              label="CGPA till Semester V"
              icon={GraduationCap}
              helper="Optional"
              type="number"
              min={0}
              max={10}
              step="0.01"
              value={cgpa}
              onChange={(e) => setCgpa(e.target.value)}
              placeholder="e.g. 7.85"
            />
            <FyugField
              label="Percentage till Semester V"
              helper="Optional"
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
            />
          </div>
        </FyugSectionCard>

        <FyugSectionCard
          icon={FileWarning}
          title="Back Papers"
          subtitle="Eligibility confirmation for Semester I–V"
          accent="amber"
        >
          <FyugSegmentedControl
            label="Do you have any Back Papers from Semester I to Semester V?"
            required
            value={hasBackPaper}
            onChange={setHasBackPaper}
          />
          {ineligible && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
              role="alert"
            >
              {FYUG_BACK_PAPER_INELIGIBLE_MSG}
            </motion.p>
          )}
        </FyugSectionCard>

        <FyugSectionCard
          id="section-declaration"
          ref={sectionRefs.declaration}
          icon={PenLine}
          title="Declaration & Signature"
          subtitle="Confirm accuracy and provide your signature"
          accent="green"
        >
          <div className={FYUG_FIELD_GAP}>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#DCE3EC] bg-slate-50/50 p-4 transition hover:border-[#2563EB]/40">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-[#DCE3EC] text-[#2563EB] focus:ring-[#2563EB]/20"
                checked={declarationAccepted}
                onChange={(e) => setDeclarationAccepted(e.target.checked)}
                required
              />
              <span className="text-sm leading-relaxed text-slate-700">
                I hereby declare that the information furnished above is true and correct to the best of my
                knowledge. I understand that if any information is found false, my application is liable to be
                cancelled.
              </span>
            </label>

            <div>
              <span className="mb-3 block text-[15px] font-medium text-slate-700">
                Signature <span className="text-[#EF4444]">*</span>
              </span>
              <label className="mb-4 flex cursor-pointer items-center gap-2 text-[13px] text-slate-600">
                <input
                  type="checkbox"
                  checked={useTypedSignature}
                  onChange={(e) => setUseTypedSignature(e.target.checked)}
                  className="h-4 w-4 rounded border-[#DCE3EC] text-[#2563EB]"
                />
                Type name instead of drawing
              </label>
              {useTypedSignature ? (
                <FyugField
                  label="Typed Signature"
                  icon={PenLine}
                  value={signatureTypedName}
                  onChange={(e) => setSignatureTypedName(e.target.value)}
                  placeholder="Type your full name as signature"
                />
              ) : (
                <div className="overflow-hidden rounded-xl border border-[#DCE3EC]">
                  <SignaturePad onChange={setSignatureDataUrl} />
                </div>
              )}
            </div>
          </div>
        </FyugSectionCard>

        <div className="space-y-4 pb-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => saveDraft(false)}
              disabled={loading}
              className="h-12 rounded-xl border-2 border-[#DCE3EC] bg-white px-8 text-[15px] font-semibold text-slate-700 transition hover:border-[#2563EB]/40 hover:bg-slate-50 disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="h-12 rounded-xl border-2 border-[#2563EB]/30 bg-blue-50 px-8 text-[15px] font-semibold text-[#2563EB] transition hover:bg-blue-100"
            >
              Preview Application
            </button>
          </div>

          <motion.button
            type="submit"
            disabled={loading || ineligible || !declarationAccepted}
            whileHover={{ y: loading ? 0 : -2 }}
            whileTap={{ scale: 0.99 }}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#0F4C81] text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Submitting…
              </>
            ) : (
              "Submit Application"
            )}
          </motion.button>
        </div>
      </form>

      <FyugPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        data={buildPayload() as Record<string, string | number | boolean | null | undefined>}
      />
    </div>
  )
}
