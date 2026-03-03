import { prisma } from "@/lib/prisma"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

interface StaffProfile {
  id: string
  name: string
  designation: string
  department: string
  category: string
  photo: string | null
  stream: string | null
  createdAt: Date
  updatedAt: Date
}

async function getNonTeachingStaff() {
  try {
    const staff = await prisma.staffProfile.findMany({
      where: { category: "non-teaching" },
      orderBy: [{ department: "asc" }, { name: "asc" }],
    })
    return staff
  } catch (error) {
    console.error("Error fetching non-teaching staff profiles:", error)
    return []
  }
}

function groupByDepartment(staff: StaffProfile[]) {
  return staff.reduce<Record<string, StaffProfile[]>>((acc, member) => {
    const key = member.department || "General"
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(member)
    return acc
  }, {})
}

export default async function NonTeachingStaffsPage() {
  const staff = await getNonTeachingStaff()
  const grouped = groupByDepartment(staff)
  const departments = Object.keys(grouped).sort((a, b) => a.localeCompare(b))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-emerald-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <header className="space-y-3 text-center">
          <h1 className="text-4xl font-bold text-slate-900">Non-Teaching Staff</h1>
          <p className="text-slate-600 max-w-3xl mx-auto">
            Meet the dedicated administrative, technical, and support personnel who ensure the smooth functioning of
            Don Bosco College.
          </p>
        </header>

        {departments.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border border-dashed border-slate-200 bg-white/70">
            <p className="text-slate-500 text-lg">Non-teaching staff profiles will appear here soon.</p>
          </div>
        ) : (
          departments.map((department) => (
            <section key={department} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">{department}</h2>
                <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-emerald-500 rounded mt-2" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {grouped[department].map((member) => (
                  <Card
                    key={member.id}
                    className="border border-slate-100 bg-white/90 backdrop-blur shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-5 space-y-3">
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100">
                        {member.photo ? (
                          <Image
                            src={member.photo}
                            alt={member.name}
                            fill
                            className="object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-emerald-100">
                            <span className="text-3xl font-semibold text-emerald-700">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 text-center">
                        <h3 className="text-lg font-semibold text-slate-900">{member.name}</h3>
                        <p className="text-sm text-slate-600">{member.designation}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  )
}


