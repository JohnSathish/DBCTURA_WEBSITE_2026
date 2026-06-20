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
    <div className="min-h-screen bg-brand-surface py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Card className="border-2 border-brand-gold/25 shadow-lg">
          <CardHeader className="bg-brand-navy text-white rounded-t-xl">
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

        <Card className="border border-brand-gold/30 bg-white/80 backdrop-blur shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-brand-text">Members</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-brand-gold/15">
                  <TableHead className="w-20 text-brand-text">Sl. No.</TableHead>
                  <TableHead className="text-brand-text">Name / Role</TableHead>
                  <TableHead className="text-brand-text">Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {governingBodyMembers.map((member) => (
                  <TableRow key={member.slNo} className="hover:bg-brand-gold/8">
                    <TableCell className="font-semibold text-brand-gold">{member.slNo}</TableCell>
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



