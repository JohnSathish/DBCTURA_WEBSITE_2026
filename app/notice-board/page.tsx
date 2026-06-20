import { prisma } from "@/lib/prisma"
import NoticeBoardClient from "@/components/notice-board/NoticeBoardClient"
import BreadcrumbTitleSetter from "@/components/layout/BreadcrumbTitleSetter"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function NoticeBoardNoticesPage() {
  const now = new Date()
  const notices = await prisma.noticeBoardNotice.findMany({
    where: {
      active: true,
      publishDate: { lte: now },
      OR: [{ expiryDate: null }, { expiryDate: { gt: now } }],
    },
    orderBy: [
      { pinned: "desc" },
      { important: "desc" },
      { publishDate: "desc" },
      { createdAt: "desc" },
    ],
  })

  return (
    <div className="min-h-screen bg-brand-surface py-8 md:py-12">
      <BreadcrumbTitleSetter title="Notice Board" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-4">
            <Link href="/" className="inline-flex">
              <Button variant="outline" className="rounded-xl">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-text mb-2">
            Notice Board
          </h1>
          <p className="text-lg text-gray-600">
            Latest notices and updates
          </p>
        </div>

        <NoticeBoardClient notices={notices as any} />
      </div>
    </div>
  )
}

