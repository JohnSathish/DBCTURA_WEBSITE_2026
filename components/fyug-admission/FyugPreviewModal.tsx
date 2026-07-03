"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type FyugFormPreview = Record<string, string | number | boolean | null | undefined>

export default function FyugPreviewModal({
  open,
  onOpenChange,
  data,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  data: FyugFormPreview
}) {
  const row = (label: string, value: unknown) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-1.5 border-b border-slate-100 text-sm">
      <span className="font-medium text-slate-600">{label}</span>
      <span className="sm:col-span-2 text-slate-900">{String(value ?? "—")}</span>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application Preview</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <h3 className="font-semibold text-brand-text">Section A — Personal</h3>
          {row("Full Name", data.fullName)}
          {row("Gender", data.gender)}
          {row("Date of Birth", data.dob)}
          {row("Mobile", data.mobile)}
          {row("WhatsApp", data.whatsapp)}
          {row("Email", data.email)}
          {row("State", data.state)}

          <h3 className="font-semibold text-brand-text pt-2">Section B — Parents</h3>
          {row("Father's Name", data.fatherName)}
          {row("Father's Mobile", data.fatherMobile)}
          {row("Mother's Name", data.motherName)}
          {row("Mother's Mobile", data.motherMobile)}

          <h3 className="font-semibold text-brand-text pt-2">Section C — College</h3>
          {row("College", data.collegeName)}
          {row("University", data.affiliatedUniversity === "OTHER" ? data.otherUniversityName : "NEHU")}

          <h3 className="font-semibold text-brand-text pt-2">Section D — Academic</h3>
          {row("Major", data.majorSubject)}
          {row("Minor", data.minorSubject)}
          {row("Honours Applied", data.honoursSubject)}
          {row("CUET Score", data.cuetScore)}
          {row("CGPA", data.cgpa)}
          {row("Percentage", data.percentage)}

          <h3 className="font-semibold text-brand-text pt-2">Section E — Back Papers</h3>
          {row("Back Papers", data.hasBackPaper ? "Yes" : "No")}
        </div>
      </DialogContent>
    </Dialog>
  )
}
