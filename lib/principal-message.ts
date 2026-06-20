import { prisma } from "@/lib/prisma"

export type PrincipalMessagePage = {
  id: string
  published: boolean
  title: string
  content: string
  featuredImage: string | null
} | null

export async function getPrincipalMessagePage(): Promise<PrincipalMessagePage> {
  return (
    (await prisma.page.findUnique({
      where: { slug: "principal-message" },
      select: { id: true, published: true, title: true, content: true, featuredImage: true },
    })) ??
    (await prisma.page.findUnique({
      where: { slug: "/principal-message" },
      select: { id: true, published: true, title: true, content: true, featuredImage: true },
    }))
  )
}

const DEFAULT_PRINCIPAL_PHOTO = "/principal.jpg"

export function principalPhotoSrc(page: PrincipalMessagePage): string {
  const url = page?.published ? page.featuredImage?.trim() : ""
  if (url) return url
  return DEFAULT_PRINCIPAL_PHOTO
}

export function principalPhotoNeedsUnoptimized(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://")
}
