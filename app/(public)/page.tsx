import { prisma } from "@/lib/prisma"
import HeroPremium from "@/components/home/HeroPremium"
import HomeFeatureCards from "@/components/home/HomeFeatureCards"
import HomeStatsBar from "@/components/home/HomeStatsBar"
import HomeAboutPreview from "@/components/home/HomeAboutPreview"
import PrincipalMessagePremium from "@/components/home/PrincipalMessagePremium"
import ShortTermCoursesPremium from "@/components/home/ShortTermCoursesPremium"
import HomeStudentSupport from "@/components/home/HomeStudentSupport"
import GalleryMasonry from "@/components/home/GalleryMasonry"
import FlashNews from "@/components/home/FlashNews"
import LogoSlider from "@/components/home/LogoSlider"
import AlumniTestimonials from "@/components/home/AlumniTestimonials"
import NewsHighlights from "@/components/home/NewsHighlights"
import alumniTestimonials from "@/data/alumni-testimonials.json"
import {
  collaborationLogos,
  mouLogos,
  sisterInstitutionLogos,
} from "@/data/home-partner-logos"

// Homepage news/hero content must reflect runtime DB, not build-time snapshot.
export const dynamic = "force-dynamic"

async function getHomeData() {
  const [about, featuredNews, galleryAlbums, testimonials, noticeBoardNotices, flashNews, heroSlides, shortTermCourses] = await Promise.all([
    prisma.page.findUnique({ where: { slug: "about" } }),
    prisma.news.findMany({
      where: { 
        publishedAt: { not: null },
        featured: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        image: true,
        publishedAt: true,
      },
    }),
    prisma.galleryAlbum.findMany({
      where: { parentAlbumId: null },
      include: {
        images: {
          orderBy: { displayOrder: "asc" },
          take: 1,
        },
      },
      orderBy: { displayOrder: "asc" },
      take: 8,
    }) as Promise<Array<{
      id: string
      title: string
      coverImage: string | null
      images: Array<{ image: string }>
    }>>,
    (async () => {
      try {
        // Check if testimonial model exists in Prisma client
        if (!(prisma as any).testimonial) {
          console.warn("Testimonial model not found in Prisma client. Please run 'npx prisma generate'")
          return []
        }
        // Try to fetch testimonials using Prisma client
        const result = await (prisma as any).testimonial.findMany({
          where: { published: true },
          orderBy: { displayOrder: "asc" },
          select: {
            id: true,
            name: true,
            designation: true,
            testimonial: true,
            image: true,
          },
        })
        console.log("Testimonials query result:", result.length)
        return result
      } catch (error: any) {
        // Silently return empty array if model doesn't exist
        // This prevents errors when Prisma client hasn't been regenerated
        if (error?.message?.includes("testimonial") || error?.message?.includes("Cannot read")) {
          console.warn("Testimonial model not available. Run 'npx prisma generate' and restart the server.")
          return []
        }
        console.error("Error fetching testimonials:", error?.message || error)
        return []
      }
    })(),
    (async () => {
      try {
        if (!(prisma as any).noticeBoardNotice) {
          console.warn("NoticeBoardNotice model not found in Prisma client. Please run 'npx prisma generate'")
          return []
        }
        const now = new Date()
        const result = await (prisma as any).noticeBoardNotice.findMany({
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
          take: 5,
          select: {
            id: true,
            title: true,
            noticeType: true,
            pdfUrl: true,
            imageUrl: true,
            publishDate: true,
            important: true,
            pinned: true,
          },
        })
        return result
      } catch (error: any) {
        if (error?.message?.includes("noticeBoardNotice") || error?.message?.includes("Cannot read")) {
          console.warn("NoticeBoardNotice model not available. Run 'npx prisma generate' and restart the server.")
          return []
        }
        console.error("Error fetching notice board notices:", error?.message || error)
        return []
      }
    })(),
    (async () => {
      try {
        // Check if flashNews model exists in Prisma client
        if (!(prisma as any).flashNews) {
          console.warn("FlashNews model not found in Prisma client. Please run 'npx prisma generate'")
          return []
        }
        // Get published flash news items
        const result = await (prisma as any).flashNews.findMany({
          where: { published: true },
          orderBy: [
            { displayOrder: "asc" },
            { createdAt: "desc" },
          ],
          select: {
            id: true,
            title: true,
            description: true,
            file: true,
            fileType: true,
          },
        })
        return result
      } catch (error: any) {
        if (error?.message?.includes("flashNews") || error?.message?.includes("Cannot read")) {
          console.warn("FlashNews model not available. Run 'npx prisma generate' and restart the server.")
          return []
        }
        console.error("Error fetching flash news:", error?.message || error)
        return []
      }
    })(),
    (async () => {
      try {
        // Check if heroSlide model exists in Prisma client
        if (!(prisma as any).heroSlide) {
          console.warn("HeroSlide model not found in Prisma client. Please run 'npx prisma generate'")
          return []
        }
        // Get published hero slides
        const result = await (prisma as any).heroSlide.findMany({
          where: { published: true },
          orderBy: [
            { displayOrder: "asc" },
            { createdAt: "desc" },
          ],
          select: {
            id: true,
            image: true,
            caption: true,
          },
        })
        return result
      } catch (error: any) {
        if (error?.message?.includes("heroSlide") || error?.message?.includes("Cannot read")) {
          console.warn("HeroSlide model not available. Run 'npx prisma generate' and restart the server.")
          return []
        }
        console.error("Error fetching hero slides:", error?.message || error)
        return []
      }
    })(),
    (async () => {
      try {
        if (!(prisma as any).shortTermCourse) {
          console.warn("ShortTermCourse model not found in Prisma client. Please run 'npx prisma generate'")
          return []
        }
        const result = await (prisma as any).shortTermCourse.findMany({
          where: { published: true },
          orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
          take: 5,
          select: {
            id: true,
            title: true,
            code: true,
            description: true,
            image: true,
          },
        })
        return result
      } catch (error: any) {
        if (error?.message?.includes("shortTermCourse") || error?.message?.includes("Cannot read")) {
          console.warn("ShortTermCourse model not available. Run 'npx prisma generate' and restart the server.")
          return []
        }
        console.error("Error fetching short-term courses:", error?.message || error)
        return []
      }
    })(),
  ])
  return { about, featuredNews, galleryAlbums, testimonials, noticeBoardNotices, flashNews, heroSlides, shortTermCourses }
}

export default async function HomePage() {
  const { about, featuredNews, galleryAlbums, testimonials, noticeBoardNotices, flashNews, heroSlides, shortTermCourses } = await getHomeData()

  const testimonialSliderItems =
    Array.isArray(testimonials) && testimonials.length > 0 ? testimonials : alumniTestimonials

  const slides = heroSlides && heroSlides.length > 0 
    ? heroSlides.map((slide: any) => ({
        src: slide.image,
        caption: slide.caption || undefined,
      }))
    : [
        { src: "/hero/slide1.jpg", caption: "Campus Aerial View" },
        { src: "/hero/slide2.jpg", caption: "Academic Excellence" },
        { src: "/hero/slide3.jpg", caption: "Vibrant Student Life" },
      ]

  return (
    <div className="home-premium min-h-screen bg-[#F8FAFC]">
      <FlashNews items={flashNews || []} />

      <section className="relative">
        <HeroPremium slides={slides} />
        <HomeFeatureCards />
      </section>

      <HomeStatsBar />

      <HomeAboutPreview about={about} noticeBoardNotices={noticeBoardNotices || []} />

      <PrincipalMessagePremium />

      <ShortTermCoursesPremium courses={shortTermCourses || []} />

      <HomeStudentSupport />

      <NewsHighlights items={featuredNews} />

      <LogoSlider
        title="Our Sister Institutions"
        subtitle="Collaborating institutions under the same management"
        logos={sisterInstitutionLogos}
      />

      <LogoSlider title="Collaboration" logos={collaborationLogos} />

      <LogoSlider title="Memorandum of Understanding (MOU)" logos={mouLogos} />

      <GalleryMasonry albums={galleryAlbums} />

      <AlumniTestimonials testimonials={testimonialSliderItems as any} />

    </div>
  )
}

