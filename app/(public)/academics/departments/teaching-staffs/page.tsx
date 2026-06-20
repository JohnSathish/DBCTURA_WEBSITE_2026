import { prisma } from "@/lib/prisma"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const STREAMS = {
  Arts: ["Education", "Economics", "English", "Garo", "Geography", "Environment", "History", "Philosophy"],
  Science: ["Botany", "Chemistry", "Mathematics", "Physics", "Zoology"],
  Commerce: ["Commerce"],
}

interface StaffProfile {
  id: string
  name: string
  designation: string
  department: string
  stream: string | null
  category: string
  photo: string | null
  createdAt: Date
  updatedAt: Date
}

async function getStaffProfiles() {
  try {
    const staff = await prisma.staffProfile.findMany({
      orderBy: [
        { createdAt: "desc" },
        { name: "asc" },
      ],
    })
    return staff
  } catch (error) {
    console.error("Error fetching staff profiles:", error)
    return []
  }
}

export default async function TeachingStaffsPage() {
  const allStaff = (await getStaffProfiles()).filter((staff) => staff.category === "teaching")

  // Get recent staff (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentStaff = allStaff.filter((staff) => staff.createdAt >= thirtyDaysAgo)

  // Group staff by stream and department
  const groupedStaff: Record<string, Record<string, StaffProfile[]>> = {}
  
  Object.keys(STREAMS).forEach((stream) => {
    groupedStaff[stream] = {}
    STREAMS[stream as keyof typeof STREAMS].forEach((dept) => {
      groupedStaff[stream][dept] = allStaff.filter(
        (s) => s.stream === stream && s.department === dept
      )
    })
  })

  return (
    <div className="min-h-screen bg-brand-surface py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Teaching Staff</h1>
          <p className="text-gray-600">Meet our dedicated faculty members</p>
        </div>

        {/* Recent Staff Section */}
        {recentStaff.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Staff Members</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {recentStaff.map((staff) => (
                <Card key={staff.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 bg-gray-100">
                      {staff.photo ? (
                        <Image
                          src={staff.photo}
                          alt={staff.name}
                          fill
                          className="object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                          <span className="text-2xl font-semibold text-brand-gold">
                            {staff.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                      {staff.name}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {staff.designation}
                    </p>
                    <p className="text-xs text-brand-gold mt-1">
                      {staff.department}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Staff by Stream and Department */}
        {Object.keys(STREAMS).map((stream) => {
          const streamDepartments = Object.keys(groupedStaff[stream])
            .map((department) => ({
              department,
              staff: groupedStaff[stream][department],
            }))
            .filter(({ staff }) => staff.length > 0)

          if (streamDepartments.length === 0) return null

          return (
            <section key={stream} className="mb-12">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{stream}</h2>
                <div className="h-1 w-32 bg-brand-gold rounded" />
              </div>

              <Tabs defaultValue={streamDepartments[0].department} className="space-y-6">
                <TabsList className="flex flex-wrap gap-2 bg-white/90 backdrop-blur border border-brand-gold/20 rounded-lg p-1 shadow-sm">
                  {streamDepartments.map(({ department }) => (
                    <TabsTrigger
                      key={department}
                      value={department}
                      className="px-4 py-2 text-sm font-semibold text-brand-text data-[state=active]:text-brand-text data-[state=active]:bg-brand-gold data-[state=active]:shadow-inner rounded-md transition-all hover:bg-brand-gold/15"
                    >
                      {department}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {streamDepartments.map(({ department, staff }) => (
                  <TabsContent
                    key={department}
                    value={department}
                    className="mt-6 focus:outline-none"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      {staff.map((member) => (
                        <Card key={member.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white/95 backdrop-blur">
                          <CardContent className="p-4 text-center space-y-3">
                            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 shadow">
                              {member.photo ? (
                                <Image
                                  src={member.photo}
                                  alt={member.name}
                                  fill
                                  className="object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                  <span className="text-2xl font-semibold text-brand-gold">
                                    {member.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-base">
                                {member.name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {member.designation}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </section>
          )
        })}

        {/* Empty State */}
        {allStaff.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No staff profiles available yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

