"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FYUG_ACADEMIC_SESSION,
  FYUG_BACK_PAPER_INELIGIBLE_MSG,
  FYUG_GENDERS,
  FYUG_HONOURS_SUBJECTS,
  FYUG_MAJOR_MINOR_SUBJECTS,
  INDIAN_STATES,
} from "@/lib/fyug-admission-constants"
import SignaturePad from "./SignaturePad"
import FyugPreviewModal from "./FyugPreviewModal"
import { Loader2 } from "lucide-react"

const DRAFT_KEY = "fyug_admission_draft_token"

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

export default function FyugAdmissionForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [recordId, setRecordId] = useState<string | undefined>()
  const [draftToken, setDraftToken] = useState<string | undefined>()

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

  const [hasBackPaper, setHasBackPaper] = useState<"yes" | "no" | "">("")
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)
  const [signatureUrl, setSignatureUrl] = useState("")
  const [signatureTypedName, setSignatureTypedName] = useState("")
  const [useTypedSignature, setUseTypedSignature] = useState(false)
  const [declarationAccepted, setDeclarationAccepted] = useState(false)

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
      setHasBackPaper(d.hasBackPaper ? "yes" : d.hasBackPaper === false && d.fullName ? "no" : "")
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
      hasBackPaper: hasBackPaper === "yes",
      signatureUrl: extra?.signatureUrl ?? (signatureUrl || undefined),
      signatureTypedName: useTypedSignature ? signatureTypedName : undefined,
      declarationAccepted,
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setMessage(null)
    try {
      const url = await uploadFile(file, "photo")
      setPhotoUrl(url)
      setPhotoPreview(url)
    } catch (err: unknown) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Photo upload failed" })
    }
  }

  async function saveDraft() {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch("/api/fyug-admissions/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save draft")
      setRecordId(data.id)
      setDraftToken(data.draftToken)
      localStorage.setItem(DRAFT_KEY, data.draftToken)
      setMessage({ type: "ok", text: "Draft saved. You can return later to complete your application." })
    } catch (err: unknown) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Save draft failed" })
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (hasBackPaper === "yes") {
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
        const detail = data.details?.fieldErrors
          ? Object.values(data.details.fieldErrors).flat().join("; ")
          : data.error
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

  const ineligible = hasBackPaper === "yes"

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
        {message && (
          <div
            className={`rounded-lg px-4 py-3 text-sm ${
              message.type === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <Section title="SECTION A — Personal Information">
          <div>
            <Label htmlFor="fullName">Full Name (Block Letters) *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value.toUpperCase())}
              className="uppercase"
              required
            />
          </div>
          <div>
            <Label>Applicant Photograph * (JPG/PNG, max 2MB)</Label>
            <Input type="file" accept="image/jpeg,image/png" onChange={handlePhotoChange} />
            {photoPreview && (
              <img src={photoPreview} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded border" />
            )}
          </div>
          <div>
            <Label>Gender *</Label>
            <div className="flex gap-4 mt-2">
              {FYUG_GENDERS.map((g) => (
                <label key={g} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={gender === g}
                    onChange={() => setGender(g)}
                    required
                  />
                  {g}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="dob">Date of Birth *</Label>
            <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input
                id="mobile"
                inputMode="numeric"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                required
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                inputMode="numeric"
                maxLength={10}
                value={whatsappSame ? mobile : whatsapp}
                onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, "").slice(0, 10))}
                disabled={whatsappSame}
              />
              <label className="flex items-center gap-2 mt-2 text-sm">
                <input
                  type="checkbox"
                  checked={whatsappSame}
                  onChange={(e) => setWhatsappSame(e.target.checked)}
                />
                Same as Mobile
              </label>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label>State *</Label>
              <Select value={state} onValueChange={setState} required>
                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Section>

        <Section title="SECTION B — Parent Details">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Father&apos;s Name *</Label>
              <Input value={fatherName} onChange={(e) => setFatherName(e.target.value)} required />
            </div>
            <div>
              <Label>Father&apos;s Mobile *</Label>
              <Input
                inputMode="numeric"
                maxLength={10}
                value={fatherMobile}
                onChange={(e) => setFatherMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                required
              />
            </div>
            <div>
              <Label>Mother&apos;s Name *</Label>
              <Input value={motherName} onChange={(e) => setMotherName(e.target.value)} required />
            </div>
            <div>
              <Label>Mother&apos;s Mobile *</Label>
              <Input
                inputMode="numeric"
                maxLength={10}
                value={motherMobile}
                onChange={(e) => setMotherMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                required
              />
            </div>
          </div>
        </Section>

        <Section title="SECTION C — Previous College Details">
          <div>
            <Label>Name of College Last Attended *</Label>
            <Input value={collegeName} onChange={(e) => setCollegeName(e.target.value)} required />
          </div>
          <div>
            <Label>Affiliated University *</Label>
            <Select value={affiliatedUniversity} onValueChange={setAffiliatedUniversity}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NEHU">NEHU, Shillong</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {affiliatedUniversity === "OTHER" && (
            <div>
              <Label>University Name *</Label>
              <Input value={otherUniversityName} onChange={(e) => setOtherUniversityName(e.target.value)} required />
            </div>
          )}
        </Section>

        <Section title="SECTION D — Academic Information">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Major Course Studied *</Label>
              <Select value={majorSubject} onValueChange={setMajorSubject}>
                <SelectTrigger><SelectValue placeholder="Select major" /></SelectTrigger>
                <SelectContent>
                  {FYUG_MAJOR_MINOR_SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Minor Course Studied *</Label>
              <Select value={minorSubject} onValueChange={setMinorSubject}>
                <SelectTrigger><SelectValue placeholder="Select minor" /></SelectTrigger>
                <SelectContent>
                  {FYUG_MAJOR_MINOR_SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Applying for Fourth-Year Honours in *</Label>
              <Select value={honoursSubject} onValueChange={setHonoursSubject}>
                <SelectTrigger><SelectValue placeholder="Select honours" /></SelectTrigger>
                <SelectContent>
                  {FYUG_HONOURS_SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>CUET 2026 Score *</Label>
              <Input type="number" min={0} step="any" value={cuetScore} onChange={(e) => setCuetScore(e.target.value)} required />
            </div>
            <div>
              <Label>CGPA till Semester V *</Label>
              <Input type="number" min={0} max={10} step="0.01" value={cgpa} onChange={(e) => setCgpa(e.target.value)} required placeholder="e.g. 7.85" />
            </div>
            <div>
              <Label>Percentage till Semester V (optional)</Label>
              <Input type="number" min={0} max={100} step="0.01" value={percentage} onChange={(e) => setPercentage(e.target.value)} />
            </div>
          </div>
        </Section>

        <Section title="SECTION E — Back Papers">
          <Label>Do you have any Back Papers from Semester I to Semester V? *</Label>
          <div className="flex gap-6 mt-2">
            {(["no", "yes"] as const).map((v) => (
              <label key={v} className="flex items-center gap-2 text-sm capitalize">
                <input
                  type="radio"
                  name="backPaper"
                  value={v}
                  checked={hasBackPaper === v}
                  onChange={() => setHasBackPaper(v)}
                  required
                />
                {v === "yes" ? "Yes" : "No"}
              </label>
            ))}
          </div>
          {ineligible && (
            <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 text-sm mt-2">
              {FYUG_BACK_PAPER_INELIGIBLE_MSG}
            </p>
          )}
        </Section>

        <Section title="SECTION F — Declaration">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={declarationAccepted}
              onChange={(e) => setDeclarationAccepted(e.target.checked)}
              required
            />
            <span>
              I hereby declare that the information furnished above is true and correct to the best of my knowledge.
              I understand that if any information is found false, my application is liable to be cancelled.
            </span>
          </label>
          <div className="mt-4">
            <Label>Signature *</Label>
            <label className="flex items-center gap-2 text-sm mb-2">
              <input
                type="checkbox"
                checked={useTypedSignature}
                onChange={(e) => setUseTypedSignature(e.target.checked)}
              />
              Type name instead of drawing
            </label>
            {useTypedSignature ? (
              <Input
                value={signatureTypedName}
                onChange={(e) => setSignatureTypedName(e.target.value)}
                placeholder="Type your full name as signature"
              />
            ) : (
              <SignaturePad onChange={setSignatureDataUrl} />
            )}
          </div>
        </Section>

        <div className="flex flex-wrap gap-3 justify-center pb-8">
          <Button type="button" variant="outline" onClick={saveDraft} disabled={loading}>
            Save Draft
          </Button>
          <Button type="button" variant="secondary" onClick={() => setPreviewOpen(true)}>
            Preview
          </Button>
          <Button type="submit" disabled={loading || ineligible || !declarationAccepted} className="bg-brand-gold text-slate-900">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Application"}
          </Button>
        </div>
      </form>

      <FyugPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        data={buildPayload() as Record<string, string | number | boolean | null | undefined>}
      />
    </>
  )
}
