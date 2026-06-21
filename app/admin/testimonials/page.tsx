import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DeleteTestimonialButton } from "@/components/admin/testimonials/DeleteTestimonialButton"
import { adminCellActions, adminCellWrap } from "@/components/admin/admin-table-classes"

export default async function TestimonialsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  let testimonials: any[] = []
  try {
    if ((prisma as any).testimonial) {
      testimonials = await prisma.testimonial.findMany({
        orderBy: [
          { displayOrder: "asc" },
          { createdAt: "desc" },
        ],
      })
    }
  } catch (error: any) {
    console.error("Error fetching testimonials:", error)
    testimonials = []
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alumni Testimonials</h1>
            <p className="text-gray-600 mt-2">Manage alumni testimonials displayed on the homepage</p>
          </div>
          <Link href="/admin/testimonials/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Testimonial
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Testimonials ({testimonials.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {testimonials.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No testimonials yet. Create your first one!</p>
              </div>
            ) : (
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[22%]">Name</TableHead>
                    <TableHead className="w-[38%]">Designation</TableHead>
                    <TableHead className="whitespace-nowrap">Image</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className={adminCellActions}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testimonials.map((testimonial) => (
                    <TableRow key={testimonial.id}>
                      <TableCell className={`font-medium ${adminCellWrap}`}>
                        <span className="line-clamp-2" title={testimonial.name}>
                          {testimonial.name}
                        </span>
                      </TableCell>
                      <TableCell className={`text-gray-600 ${adminCellWrap}`}>
                        <span className="line-clamp-2" title={testimonial.designation}>
                          {testimonial.designation}
                        </span>
                      </TableCell>
                      <TableCell>
                        {testimonial.image ? (
                          <span className="text-sm text-blue-600">Yes</span>
                        ) : (
                          <span className="text-sm text-gray-400">No image</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            testimonial.published
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {testimonial.published ? "Published" : "Draft"}
                        </span>
                      </TableCell>
                      <TableCell className={adminCellActions}>
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/testimonials/${testimonial.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <DeleteTestimonialButton testimonialId={testimonial.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

