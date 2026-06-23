import { Metadata } from "next"
import AdministrationSectionLayout from "@/components/layout/AdministrationSectionLayout"
import CommitteesDisplay from "@/components/committees/CommitteesDisplay"
import {
  getCommitteeMeta,
  getCommittees,
  getExOfficioMembers,
} from "@/lib/committees-service"

export const metadata: Metadata = {
  title: "Committees | Don Bosco College, Tura",
  description:
    "Committees for academic year 2026–2027 at Don Bosco College, Tura — IQAC, Academic Council, student welfare, and institutional governance.",
}

export default async function CommitteesPage() {
  const [meta, exOfficio, committees] = await Promise.all([
    getCommitteeMeta(),
    getExOfficioMembers(),
    getCommittees({ includeDrafts: false }),
  ])

  const published = meta.published && committees.length > 0

  return (
    <AdministrationSectionLayout path="/administration/committees" title="Committees">
      {published ? (
        <CommitteesDisplay
          academicYear={meta.academicYear}
          exOfficio={exOfficio}
          committees={committees}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/85 p-10 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-brand-navy">Committees</h1>
          <p className="mt-3 text-slate-600">
            Committee information for the current academic year is being prepared. Please check back soon.
          </p>
        </div>
      )}
    </AdministrationSectionLayout>
  )
}
