import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit } from "lucide-react"
import Image from "next/image"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DeleteHeroSlideButton } from "@/components/admin/hero-slides/DeleteHeroSlideButton"

export default async function HeroSlidesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  let slides: any[] = []
  try {
    if ((prisma as any).heroSlide) {
      slides = await prisma.heroSlide.findMany({
        orderBy: [
          { displayOrder: "asc" },
          { createdAt: "desc" },
        ],
      })
    }
  } catch (error: any) {
    console.error("Error fetching hero slides:", error)
    slides = []
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hero Slides</h1>
            <p className="text-gray-600 mt-2">Manage hero images displayed on the homepage</p>
          </div>
          <Link href="/admin/hero-slides/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Hero Slide
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hero Slides ({slides.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {slides.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No hero slides yet. Create your first one!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {slides.map((slide) => (
                  <div key={slide.id} className="border rounded-lg p-4 flex items-center gap-4">
                    <div className="relative w-32 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-200">
                      <Image
                        src={slide.image}
                        alt={slide.caption || "Hero slide"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{slide.caption || "No caption"}</p>
                      <p className="text-sm text-gray-600">{slide.image}</p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                          slide.published
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {slide.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/hero-slides/${slide.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DeleteHeroSlideButton slideId={slide.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

