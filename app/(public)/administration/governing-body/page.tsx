import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const governingBodyMembers = [
  {
    slNo: "1",
    name: "FR. JANUARIUS S. SANGMA, SDB (Salesian Provincial) – President",
    address: "Don Bosco Provincial House, P.B. 258, A.R. Baruah Road, Panbazar, Guwahati – 781 001.",
  },
  {
    slNo: "2",
    name: "DR. MEENA A SANGMA (Member – Govt. Representative)",
    address: "Principal, CTE, Rongkhon, West Garo Hills, Meghalaya, Tura -794 002",
  },
  {
    slNo: "3",
    name: "FR. JOSEPH LANGNE TERON, SDB (Salesian Vice Provincial)",
    address: "Provincial House, Don Bosco, Pan Bazaar, Guwahati -781 001.",
  },
  {
    slNo: "4",
    name: "FR. BIVAN RODRIQUES MUKHIM, SDB (Principal cum Secretary)",
    address: "Don Bosco College, Sampalgre, West Garo Hills, Meghalaya, Tura -794 002",
  },
  {
    slNo: "5",
    name: "FR. ZACHARIAS VARICKASERIL, SDB – Member",
    address: "Principal, Don Bosco College of Teachers Education, Sampalgre, West Garo Hills, Meghalaya, Tura -794 002",
  },
  {
    slNo: "6",
    name: "FR. JOGESH B. SANGMA, SDB – Member",
    address: "Principal, Don Bosco College, HS Section, Sampalgre, West Garo Hills, Meghalaya, Tura -794 002",
  },
  {
    slNo: "7",
    name: "FR. AMIT CHAMA LAKRA, SDB – Member",
    address: "Parish Priest, Holy Cross Church, Rongkhon, West Garo Hills, Meghalaya, Tura -794 002",
  },
  {
    slNo: "8",
    name: "FR. LEVIO T. SANGMA – Bishop’s Nominee - Member",
    address: "Parish Priest, Sacred Heart Shrine, West Garo Hills, Meghalaya, Tura -794 002",
  },
  {
    slNo: "9",
    name: "FR. ALEX K MATHEW, SDB – Member",
    address: "Rector cum P.P., St. Dominic Parish, West Garo Hills, Garobadha",
  },
  {
    slNo: "10",
    name: "FR. CHARLES CH SANGMA, SDB – Member",
    address: "Rector cum Parish Priest, Don Bosco Mendal, North Garo Hills, Meghalaya",
  },
  {
    slNo: "11",
    name: "SR. MARCELLINA S. SANGMA, FMA – Women’s Representative",
    address: "Superior, Auxilium, Allotgre, West Garo Hills, Tura -794 002",
  },
  {
    slNo: "12",
    name: "Prof. N. S. CH. MOMIN – NEHU Representative",
    address: "Education Department, NEHU Tura Campus, Chasingre, Tura -794 002",
  },
  {
    slNo: "13",
    name: "Dr. FAMELINE K. MARAK – NEHU Representative",
    address: "Garo Department, NEHU Tura Campus, Chasingre, Tura -794 002",
  },
  {
    slNo: "14",
    name: "Dr. UMA ROY BHOWMIK – Teacher Representative",
    address: "Don Bosco College, Sampalgre, West Garo Hills, Tura -794 002",
  },
  {
    slNo: "15",
    name: "Dr. SABINDRA RAJBONGSHI – Teacher Representative",
    address: "Don Bosco College, Sampalgre, West Garo Hills, Tura -794 002",
  },
]

export default function GoverningBodyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Card className="border-2 border-indigo-100/70 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl">
            <CardTitle className="text-3xl font-semibold">Governing Body</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <p className="text-slate-700 leading-relaxed">
              Don Bosco College, Tura, is an educational institution of the Catholic Church belonging to the
              global Don Bosco Society and managed by the Salesians of Don Bosco, North East India. The Salesian
              Provincial Superior serves as the President of the Governing Body, while the Principal of the College
              acts as the Secretary of the Governing Body.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-indigo-200/60 bg-white/80 backdrop-blur shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-indigo-900">Members</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-indigo-100/80">
                  <TableHead className="w-20 text-indigo-900">Sl. No.</TableHead>
                  <TableHead className="text-indigo-900">Name / Role</TableHead>
                  <TableHead className="text-indigo-900">Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {governingBodyMembers.map((member) => (
                  <TableRow key={member.slNo} className="hover:bg-indigo-50/60">
                    <TableCell className="font-semibold text-indigo-700">{member.slNo}</TableCell>
                    <TableCell className="font-medium text-slate-800">{member.name}</TableCell>
                    <TableCell className="text-slate-700">{member.address}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



