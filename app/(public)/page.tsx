import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import HeroSlider from "@/components/home/HeroSlider"
import NewsSidebar from "@/components/home/NewsSidebar"
import FlashNews from "@/components/home/FlashNews"
import LogoSlider from "@/components/home/LogoSlider"
import AlumniTestimonials from "@/components/home/AlumniTestimonials"
import NewsHighlights from "@/components/home/NewsHighlights"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

async function getHomeData() {
  const [about, news, featuredNews, galleryAlbums, testimonials, noticeBoardEvents, flashNews, heroSlides] = await Promise.all([
    prisma.page.findUnique({ where: { slug: "about" } }),
    prisma.news.findMany({
      where: { publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      take: 12,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
      },
    }),
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
      take: 4,
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
        // Check if noticeBoardEvent model exists in Prisma client
        if (!(prisma as any).noticeBoardEvent) {
          console.warn("NoticeBoardEvent model not found in Prisma client. Please run 'npx prisma generate'")
          return []
        }
        // Get upcoming events (today and future)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const result = await (prisma as any).noticeBoardEvent.findMany({
          where: {
            published: true,
            eventDate: {
              gte: today,
            },
          },
          orderBy: [
            { eventDate: "asc" },
            { displayOrder: "asc" },
          ],
          take: 5,
          select: {
            id: true,
            title: true,
            description: true,
            eventDate: true,
          },
        })
        
        console.log("Notice Board Events fetched:", result.length, result)
        return result
      } catch (error: any) {
        if (error?.message?.includes("noticeBoardEvent") || error?.message?.includes("Cannot read")) {
          console.warn("NoticeBoardEvent model not available. Run 'npx prisma generate' and restart the server.")
          return []
        }
        console.error("Error fetching notice board events:", error?.message || error)
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
  ])
  return { about, news, featuredNews, galleryAlbums, testimonials, noticeBoardEvents, flashNews, heroSlides }
}

export default async function HomePage() {
  const { about, news, featuredNews, galleryAlbums, testimonials, noticeBoardEvents, flashNews, heroSlides } = await getHomeData()

  // Debug: Log testimonials count
  console.log("Testimonials fetched:", testimonials.length)
  console.log("Notice Board Events:", noticeBoardEvents?.length || 0, noticeBoardEvents)

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
    <div className="min-h-screen">
      {/* Hero Image Slider */}
      <HeroSlider slides={slides} />

      {/* Flash News Banner */}
      <FlashNews items={flashNews || []} />

      {/* About + News two-column section */}
      <section className="py-6 md:py-10 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2">
            <Card className="border-2 border-indigo-200 shadow-lg hover:shadow-xl transition-shadow h-full">
              <CardHeader className="pb-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-white">Welcome to Don Bosco College, Tura</CardTitle>
              </CardHeader>
              <CardContent className="pb-[calc(1.5rem-100px)]">
                {about?.content ? (
                  <div className="prose max-w-none text-slate-700">
                    <div className="relative float-left mr-6 mb-4 w-48 md:w-64 rounded-lg overflow-hidden shadow">
                      <Image
                        src="/don-bosco.jpg"
                        alt="Saint John Bosco"
                        width={256}
                        height={340}
                        className="object-cover w-full"
                        priority
                      />
                    </div>
                    <div
                      className="overflow-auto pr-2"
                      dangerouslySetInnerHTML={{ __html: about.content }}
                    />
                  </div>
                ) : (
                  <div className="prose max-w-none text-slate-700">
                    <div className="relative float-left mr-6 mb-4 w-48 md:w-64 rounded-lg overflow-hidden shadow">
                      <Image
                        src="/don-bosco.jpg"
                        alt="Saint John Bosco"
                        width={256}
                        height={340}
                        className="object-cover w-full"
                        priority
                      />
                    </div>
                    <p>
                      Saint John Bosco, popularly known as Don Bosco, was a priest of the Catholic Church, who came to the rescue of the poor, disadvantaged youth of his time with his innovative method of educating them through total immersion in their world, with personal involvement in their lives and aspirations, with a dedication that was total.
                    </p>
                    <p>
                      To ensure that his dedication to their cause shone through his actions, he lived with and for them. He based his education on the three great principles of reason, religion and loving kindness, as a caring father, doing everything possible for their welfare.
                    </p>
                    <p>
                      The system of education that he envisioned aims to create generations of young men and women who are intellectually competent, morally upright, socially committed, spiritually inspired and devoted to their country and the world. Don Bosco is the founder of the Don Bosco Society, continues to be our inspiration.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 flex">
            <div className="w-full">
              <NewsSidebar items={noticeBoardEvents || []} pageSize={4} />
            </div>
          </div>
        </div>
      </section>

      {/* Principal Message Section */}
      <section className="py-6 md:py-10 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-2 border-cyan-300 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="text-white">Principal's Message</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none text-slate-700">
                <div className="relative float-left mr-6 mb-4 w-48 md:w-64 rounded-lg overflow-hidden shadow">
                  <Image
                    src="/principal.jpg"
                    alt="Fr Januarius S Sangma SDB, Principal"
                    width={256}
                    height={340}
                    className="object-cover w-full"
                  />
                </div>
                <div>
                  <p className="font-semibold mb-2">My dear Staff and Students,</p>
                  
                  <p className="mb-2">Greetings with love!</p>
                  
                  <p className="mb-2">
                    I thank God for this blessed opportunity to be at Don Bosco College, Tura, and to contribute to the quality education of thousands of young minds at our esteemed institution. It is with great joy and anticipation that I invite you all to collaborate in creating a nurturing, family-like atmosphere within this revered temple of learning.
                  </p>
                  
                  <p className="mb-2">
                    Together, as a unified community, we can achieve remarkable, nay impossible things. While the management and staff are dedicated to giving their best, we also expect the same relentless commitment and focus from our students, which is not impossible. Your ladder to success in education depends on your daily decision and actions both at home and in college. This involves regular attendance, attentiveness in class, daily study, and embracing extra reading. Remember, as Nelson Mandela said, "Education is the most powerful weapon which you can use to change the world." By taking your studies seriously now, you lay the foundation for a future where you can live fulfilling lives and contribute significantly to nation-building.
                  </p>
                  
                  <p className="mb-2">
                    Furthermore, I urge you to avoid all harmful habits and to always strive to maintain a positive and supportive atmosphere within the college, your second home. Never hesitate to seek help in times of need, and actively participate in all college programs. As Albert Einstein wisely noted, "The only source of knowledge is experience."
                  </p>
                  
                  <p className="mb-2">
                    Let us work together to make this academic journey enriching and memorable. With God's grace and our combined efforts, we can create a thriving community of learners and leaders.
                  </p>
                  
                  <p className="mb-2">Blessings and best wishes,</p>
                  
                  <p className="mb-0 font-semibold">
                    Yours sincerely,<br />
                    <span className="font-normal">Fr Januarius S Sangma SDB</span><br />
                    <span className="font-normal">Principal</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Short Term Courses Section */}
      <section className="py-6 md:py-10 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-2 border-orange-200 shadow-lg">
            <CardHeader className="pb-4 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-white">Short Term Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Course 1 - CAFA */}
                <div className="border-2 border-indigo-300 rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:border-indigo-500 transition-all transform hover:-translate-y-1">
                  <div className="relative w-full h-48">
                    <Image
                      src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
                      alt="Certificate Course in A·Chik Folk Arts"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 flex flex-col">
                    <h3 className="font-semibold text-base text-indigo-900 mb-2 leading-tight">
                      CERTIFICATE COURSE IN A·CHIK FOLK ARTS (CAFA)
                    </h3>
                    <p className="text-sm text-gray-700 mb-3 flex-grow">
                      Learn traditional Chik folk arts, including cultural practices, traditional crafts, and artistic expressions.
                    </p>
                          <Button asChild variant="outline" size="sm" className="w-full mt-auto border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-500 hover:text-white">
                      <Link href="/courses/cafa">Read More</Link>
                    </Button>
                  </div>
                </div>

                {/* Course 2 - BCCS */}
                <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative w-full h-48">
                    <Image
                      src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop"
                      alt="Basic Course on Computer Skills"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 flex flex-col">
                    <h3 className="font-semibold text-base text-indigo-900 mb-2 leading-tight">
                      Basic Course on Computer Skills (BCCS)
                    </h3>
                    <p className="text-sm text-gray-700 mb-3 flex-grow">
                      Develop fundamental computer skills including basic operations, file management, and essential software applications.
                    </p>
                          <Button asChild variant="outline" size="sm" className="w-full mt-auto border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-500 hover:text-white">
                      <Link href="/courses/bccs">Read More</Link>
                    </Button>
                  </div>
                </div>

                {/* Course 3 - ELPC */}
                <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative w-full h-48">
                    <Image
                      src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop"
                      alt="English Language Proficiency Course"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 flex flex-col">
                    <h3 className="font-semibold text-base text-indigo-900 mb-2 leading-tight">
                      English Language Proficiency Course (ELPC)
                    </h3>
                    <p className="text-sm text-gray-700 mb-3 flex-grow">
                      Enhance your English language skills through comprehensive training in reading, writing, speaking, and listening.
                    </p>
                          <Button asChild variant="outline" size="sm" className="w-full mt-auto border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-500 hover:text-white">
                      <Link href="/courses/elpc">Read More</Link>
                    </Button>
                  </div>
                </div>

                {/* Course 4 - BCCH */}
                <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative w-full h-48">
                    <Image
                      src="https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&h=300&fit=crop"
                      alt="Basic Course in Computer Hardware"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 flex flex-col">
                    <h3 className="font-semibold text-base text-indigo-900 mb-2 leading-tight">
                      Basic Course in Computer Hardware (BCCH)
                    </h3>
                    <p className="text-sm text-gray-700 mb-3 flex-grow">
                      Learn computer hardware fundamentals, assembly, troubleshooting, and maintenance of computer systems.
                    </p>
                          <Button asChild variant="outline" size="sm" className="w-full mt-auto border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-500 hover:text-white">
                      <Link href="/courses/bcch">Read More</Link>
                    </Button>
                  </div>
                </div>

                {/* Course 5 - BCTE */}
                <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative w-full h-48">
                    <Image
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop"
                      alt="Basic Course in Tally ERP9"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 flex flex-col">
                    <h3 className="font-semibold text-base text-indigo-900 mb-2 leading-tight">
                      Basic Course in Tally ERP9 (BCTE)
                    </h3>
                    <p className="text-sm text-gray-700 mb-3 flex-grow">
                      Master Tally ERP9 software for accounting, inventory management, and financial record keeping.
                    </p>
                          <Button asChild variant="outline" size="sm" className="w-full mt-auto border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-500 hover:text-white">
                      <Link href="/courses/bcte">Read More</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* News Highlights Section */}
      <NewsHighlights items={featuredNews} />

      {/* Our Sisters Concerns Logo Slider */}
      <LogoSlider
        title="Our Sisters Concerns"
        logos={[
          {
            src: "https://placehold.co/200x120/1e40af/ffffff?text=Salesian+Province+of+Guwahati&font=roboto",
            alt: "Salesian Province of Guwahati - ING",
            href: "#",
          },
          {
            src: "https://placehold.co/200x120/7c3aed/ffffff?text=St.+Anthony%27s+College&font=roboto",
            alt: "St. Anthony's College, Shillong",
            href: "#",
          },
          {
            src: "https://placehold.co/200x120/dc2626/ffffff?text=Don+Bosco+College+Bongaigaon&font=roboto",
            alt: "Don Bosco College, Bongaigaon",
            href: "#",
          },
          {
            src: "https://placehold.co/200x120/059669/ffffff?text=Don+Bosco+School+Tura&font=roboto",
            alt: "Don Bosco School, Tura",
            href: "#",
          },
          {
            src: "https://placehold.co/200x120/be185d/ffffff?text=Salesian+School+Shillong&font=roboto",
            alt: "Salesian School, Shillong",
            href: "#",
          },
        ].slice(0, 5)}
      />

      {/* Collaboration Logo Slider */}
      <LogoSlider
        title="Collaboration"
        logos={[
          {
            src: "https://placehold.co/200x120/1e3a8a/ffffff?text=IUS+-+Salesian+Institutions&font=roboto",
            alt: "IUS - Salesian Institutions for Higher Education",
            href: "#",
          },
          {
            src: "https://placehold.co/200x120/581c87/ffffff?text=DBHEI+-+Research+%26+Innovation&font=roboto",
            alt: "DBHEI Don Bosco Higher Education, Innovation & Research",
            href: "#",
          },
          {
            src: "https://placehold.co/200x120/991b1b/ffffff?text=AIACHE&font=roboto",
            alt: "AIACHE - All India Association for Christian Higher Education",
            href: "#",
          },
          {
            src: "https://placehold.co/200x120/155e75/ffffff?text=UGC+-+University+Grants+Commission&font=roboto",
            alt: "University Grants Commission",
            href: "#",
          },
          {
            src: "https://placehold.co/200x120/14532d/ffffff?text=NAAC+-+National+Assessment&font=roboto",
            alt: "NAAC - National Assessment and Accreditation Council",
            href: "#",
          },
        ].slice(0, 5)}
      />

      {/* Memorandum of Understanding (MOU) Logo Slider */}
      <LogoSlider
        title="Memorandum of Understanding (MOU)"
        logos={[
          {
            src: "https://placehold.co/200x120/1e40af/ffffff?text=Industry+Partner+1&font=roboto",
            alt: "Industry Partner 1",
            href: "#",
          },
          {
            src: "https://placehold.co/200x120/7c3aed/ffffff?text=Corporate+Partner+2&font=roboto",
            alt: "Corporate Partner 2",
            href: "#",
          },
          {
            src: "https://placehold.co/200x120/dc2626/ffffff?text=Research+Institution+3&font=roboto",
            alt: "Research Institution 3",
            href: "#",
          },
          {
            src: "https://placehold.co/200x120/059669/ffffff?text=International+University+4&font=roboto",
            alt: "International University 4",
            href: "#",
          },
          {
            src: "https://placehold.co/200x120/be185d/ffffff?text=Technology+Partner+5&font=roboto",
            alt: "Technology Partner 5",
            href: "#",
          },
        ].slice(0, 5)}
      />

      {/* Gallery Section */}
      <section className="py-8 md:py-12 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-8 text-center">
            Gallery
          </h2>

          {galleryAlbums.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
                {galleryAlbums.map((album: any) => {
                  const coverImage = album.coverImage || (album.images && album.images[0]?.image) || null
                  return (
                    <Link
                      key={album.id}
                      href={`/gallery/albums/${album.id}`}
                      className="group block"
                    >
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow mb-3">
                        {coverImage ? (
                          <Image
                            src={coverImage}
                            alt={album.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">No Image</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-center font-semibold text-slate-800 text-base md:text-lg">
                        {album.title}
                      </h3>
                    </Link>
                  )
                })}
              </div>

              <div className="text-center">
                <Button
                  asChild
                  className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 text-white px-8 py-6 rounded-lg text-base md:text-lg font-medium shadow-lg transform hover:scale-105 transition-all"
                >
                  <Link href="/gallery">
                    View All
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No gallery albums available yet.</p>
              <p className="text-sm mt-2">Albums will appear here once created from the admin panel.</p>
            </div>
          )}
        </div>
      </section>

      {/* Alumni Testimonials Section */}
      {testimonials && testimonials.length > 0 ? (
        <AlumniTestimonials testimonials={testimonials} />
      ) : null}
    </div>
  )
}

