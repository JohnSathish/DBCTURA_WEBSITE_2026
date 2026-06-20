import BreadcrumbTitleSetter from "@/components/layout/BreadcrumbTitleSetter"
import GalleryView, { type GalleryAlbumItem } from "@/components/gallery/GalleryView"
import { prisma } from "@/lib/prisma"

export const metadata = {
  title: "Gallery | Don Bosco College, Tura",
  description: "Browse photo albums and campus events from Don Bosco College, Tura.",
}

export default async function GalleryPage() {
  const albums = await prisma.galleryAlbum.findMany({
    where: { parentAlbumId: null },
    include: {
      images: {
        orderBy: { displayOrder: "asc" },
        take: 1,
      },
      _count: {
        select: { images: true },
      },
    },
    orderBy: { displayOrder: "asc" },
  })

  const items: GalleryAlbumItem[] = albums.map((album) => ({
    id: album.id,
    title: album.title,
    description: album.description,
    coverImage: album.coverImage || album.images[0]?.image || null,
    imageCount: album._count.images,
  }))

  return (
    <>
      <BreadcrumbTitleSetter title="Gallery" />
      <GalleryView albums={items} />
    </>
  )
}
