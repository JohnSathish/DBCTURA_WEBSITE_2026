import BreadcrumbTitleSetter from "@/components/layout/BreadcrumbTitleSetter"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Row = {
  slNo: number
  major: string
  minors: string[]
}

const SUBJECT_COMBINATIONS: Row[] = [
  { slNo: 1, major: "ECONOMICS", minors: ["Geography", "History", "Political Science", "Sociology"] },
  { slNo: 2, major: "EDUCATION", minors: ["Garo", "History", "Philosophy"] },
  { slNo: 3, major: "ENGLISH", minors: ["Education", "Geography", "Philosophy", "Political Science"] },
  { slNo: 4, major: "GARO", minors: ["Education", "Geography", "Philosophy", "Sociology"] },
  { slNo: 5, major: "GEOGRAPHY", minors: ["Economics", "Garo"] },
  { slNo: 6, major: "HISTORY", minors: ["Economics", "Philosophy", "Political Science", "Sociology"] },
  { slNo: 7, major: "PHILOSOPHY", minors: ["Education", "Garo", "Geography"] },
  { slNo: 8, major: "POLITICAL SCIENCE", minors: ["Economics", "Education", "History", "Sociology"] },
  { slNo: 9, major: "SOCIOLOGY", minors: ["Economics", "Garo", "History", "Political Science"] },
  { slNo: 10, major: "BOTANY", minors: ["Zoology", "Chemistry"] },
  { slNo: 11, major: "CHEMISTRY", minors: ["Mathematics", "Physics"] },
  { slNo: 12, major: "MATHEMATICS", minors: ["Physics", "Chemistry"] },
  { slNo: 13, major: "ZOOLOGY", minors: ["Botany", "Chemistry"] },
  { slNo: 14, major: "PHYSICS", minors: ["Chemistry", "Mathematics"] },
  { slNo: 15, major: "ACCOUNTING FOR BUSINESS", minors: ["Economics", "Mathematics", "Geography"] },
]

export default function ExploreCoursesPage() {
  return (
    <div className="min-h-screen bg-brand-surface py-8 md:py-12">
      <BreadcrumbTitleSetter title="Explore Courses" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-navy">
            Don Bosco College, Tura
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-brand-text">
            Explore Courses
          </h1>
          <p className="mt-2 text-slate-600">
            Four Year Undergraduate Programme — Subject Combinations (Morning / Day / Evening Shift)
          </p>
        </div>

        <Card className="rounded-3xl border-slate-200 shadow-sm shadow-slate-900/5 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white">
            <CardTitle className="text-base sm:text-lg">
              Subject combinations table
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-amber-50">
                  <tr className="text-left">
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-700 border-b border-amber-200">
                      SL NO
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-700 border-b border-amber-200">
                      Major
                    </th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-700 border-b border-amber-200">
                      Any one of the following subjects as Minor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {SUBJECT_COMBINATIONS.map((row) => (
                    <tr key={row.slNo} className="odd:bg-amber-50/50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-700 align-top border-b border-slate-100">
                        {row.slNo}.
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 align-top border-b border-slate-100">
                        {row.major}
                      </td>
                      <td className="px-4 py-3 text-slate-700 align-top border-b border-slate-100">
                        <div className="flex flex-wrap gap-2">
                          {row.minors.map((m) => (
                            <span
                              key={m}
                              className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

