import BreadcrumbTitleSetter from "@/components/layout/BreadcrumbTitleSetter"
import DownloadsView, { type DownloadItem } from "@/components/downloads/DownloadsView"
import { prisma } from "@/lib/prisma"

export const metadata = {
  title: "Downloads | Don Bosco College, Tura",
  description: "Forms, prospectuses, and official documents available for download.",
}

export default async function DownloadsPage() {
  const downloads = await prisma.download.findMany({
    orderBy: { uploadedAt: "desc" },
  })

  const items: DownloadItem[] = downloads.map((d) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    file: d.file,
    category: d.category,
    uploadedAt: d.uploadedAt.toISOString(),
  }))

  return (
    <>
      <BreadcrumbTitleSetter title="Downloads" />
      <DownloadsView downloads={items} />
    </>
  )
}
