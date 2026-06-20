import { notFound } from "next/navigation"

import BreadcrumbTitleSetter from "@/components/layout/BreadcrumbTitleSetter"
import GalleryAlbumView from "@/components/gallery/GalleryAlbumView"
import { prisma } from "@/lib/prisma"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const prismaAny = prisma as any
  if (!prismaAny.galleryEvent) return { title: "Gallery Event" }
  const event = await prismaAny.galleryEvent.findUnique({
    where: { id },
    select: { title: true },
  })
  return { title: event ? `${event.title} | Gallery` : "Gallery Event" }
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const prismaAny = prisma as any

  if (!prismaAny.galleryEvent || typeof prismaAny.galleryEvent.findUnique !== "function") {
    notFound()
  }

  const event = await prismaAny.galleryEvent.findUnique({
    where: { id },
    include: {
      album: { select: { id: true, title: true } },
      images: { orderBy: { displayOrder: "asc" } },
    },
  })

  if (!event) {
    notFound()
  }

  const description = [
    event.description,
    event.eventDate
      ? `Event date: ${new Date(event.eventDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`
      : null,
    event.album ? `Album: ${event.album.title}` : null,
  ]
    .filter(Boolean)
    .join("\n\n")

  return (
    <>
      <BreadcrumbTitleSetter title={event.title} />
      <GalleryAlbumView
        title={event.title}
        description={description || null}
        parentAlbum={event.album ? { id: event.album.id, title: event.album.title } : null}
        photos={(Array.isArray(event.images) ? event.images : []).map((image: any) => ({
          id: image.id,
          src: image.image,
          title: image.title,
        }))}
      />
    </>
  )
}
