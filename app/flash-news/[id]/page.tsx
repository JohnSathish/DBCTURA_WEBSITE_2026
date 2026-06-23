import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { File, Download, ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import BreadcrumbTitleSetter from "@/components/layout/BreadcrumbTitleSetter"

export default async function FlashNewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let flashNews: any = null
  try {
    if (!(prisma as any).flashNews) {
      notFound()
    }
    flashNews = await prisma.flashNews.findUnique({
      where: { id },
    })
  } catch (error: any) {
    console.error("Error fetching flash news:", error)
    notFound()
  }

  if (!flashNews || !flashNews.published) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-brand-surface py-8 md:py-12">
      <BreadcrumbTitleSetter title={flashNews.title} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/" className="text-brand-text hover:text-brand-hover mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <Card className="border-2 border-brand-hover/25 shadow-lg overflow-hidden">
          <CardHeader className="bg-brand-navy text-white rounded-t-lg">
            <CardTitle className="text-white text-xl md:text-2xl lg:text-3xl break-words hyphens-auto">
              {flashNews.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 overflow-hidden">
            {flashNews.description && (
              <div className="prose max-w-none mb-6 overflow-hidden">
                <p className="text-gray-700 text-base md:text-lg leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                  {flashNews.description}
                </p>
              </div>
            )}

            {flashNews.file && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attached File</h3>
                {flashNews.fileType === "pdf" ? (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-2 border-brand-hover/20">
                    <File className="h-10 w-10 text-red-500" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">PDF Document</p>
                      <p className="text-sm text-gray-600">{flashNews.file.split("/").pop()}</p>
                      {flashNews.downloadCount > 0 ? (
                        <p className="mt-1 text-xs text-slate-500">
                          Downloaded {flashNews.downloadCount.toLocaleString()} time
                          {flashNews.downloadCount === 1 ? "" : "s"}
                        </p>
                      ) : null}
                    </div>
                    <a
                      href={`/api/flash-news/${flashNews.id}/download`}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-hover text-white rounded-lg hover:opacity-90 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </a>
                  </div>
                ) : (
                  <div className="rounded-lg overflow-hidden border-2 border-brand-hover/20">
                    <Image
                      src={flashNews.file}
                      alt={flashNews.title}
                      width={800}
                      height={600}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                )}
              </div>
            )}

            {!flashNews.description && !flashNews.file && (
              <p className="text-gray-500 text-center py-8">
                No additional content available for this flash news item.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

