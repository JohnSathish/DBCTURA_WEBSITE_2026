import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download as DownloadIcon } from "lucide-react"
import Link from "next/link"

export default async function DownloadsPage() {
  const downloads = await prisma.download.findMany({
    orderBy: { uploadedAt: "desc" },
  })

  const groupedDownloads = downloads.reduce((acc, download) => {
    const category = download.category || "Uncategorized"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(download)
    return acc
  }, {} as Record<string, typeof downloads>)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Downloads</h1>

      {downloads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No downloads available yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedDownloads).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-2xl font-semibold mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((download) => (
                  <Card key={download.id}>
                    <CardHeader>
                      <CardTitle>{download.title}</CardTitle>
                      {download.description && (
                        <CardDescription>{download.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <Link href={download.file} target="_blank">
                        <Button>
                          <DownloadIcon className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

