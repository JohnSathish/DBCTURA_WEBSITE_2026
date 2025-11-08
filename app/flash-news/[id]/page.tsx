import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { File, Download, ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/" className="text-purple-600 hover:text-purple-700 mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <Card className="border-2 border-purple-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-white text-2xl md:text-3xl">{flashNews.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            {flashNews.description && (
              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                  {flashNews.description}
                </p>
              </div>
            )}

            {flashNews.file && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attached File</h3>
                {flashNews.fileType === "pdf" ? (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-2 border-purple-200">
                    <File className="h-10 w-10 text-red-500" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">PDF Document</p>
                      <p className="text-sm text-gray-600">{flashNews.file.split("/").pop()}</p>
                    </div>
                    <a
                      href={flashNews.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </a>
                  </div>
                ) : (
                  <div className="rounded-lg overflow-hidden border-2 border-purple-200">
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

