import { notFound } from "next/navigation"

import BreadcrumbTitleSetter from "@/components/layout/BreadcrumbTitleSetter"
import GalleryAlbumView from "@/components/gallery/GalleryAlbumView"
import { prisma } from "@/lib/prisma"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const album = await prisma.galleryAlbum.findUnique({
    where: { id },
    select: { title: true },
  })
  return {
    title: album ? `${album.title} | Gallery` : "Gallery",
  }
}

export default async function AlbumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const album = await prisma.galleryAlbum.findUnique({
    where: { id },
    include: {
      parentAlbum: {
        select: { id: true, title: true },
      },
      images: {
        orderBy: { displayOrder: "asc" },
      },
    },
  })

  if (!album) {
    notFound()
  }

  return (
    <>
      <BreadcrumbTitleSetter title={album.title} />
      <GalleryAlbumView
        title={album.title}
        description={album.description}
        parentAlbum={album.parentAlbum}
        photos={album.images.map((img) => ({
          id: img.id,
          src: img.image,
          title: img.title,
        }))}
      />
    </>
  )
}
