import Image from "next/image"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { Quote } from "lucide-react"
import { authOptions } from "@/lib/auth"
import {
  getPrincipalMessagePage,
  principalPhotoNeedsUnoptimized,
  principalPhotoSrc,
} from "@/lib/principal-message"

const FALLBACK_HTML = `
  <p><strong>My dear Staff and Students,</strong></p>
  <p>Greetings with love!</p>
  <p>
    I thank God for this blessed opportunity to be at Don Bosco College, Tura, and to contribute to the quality education
    of thousands of young minds at our esteemed institution. It is with great joy and anticipation that I invite you all
    to collaborate in creating a nurturing, family-like atmosphere within this revered temple of learning.
  </p>
  <p>
    Together, as a unified community, we can achieve remarkable, nay impossible things. While the management and staff are
    dedicated to giving their best, we also expect the same relentless commitment and focus from our students, which is not
    impossible. Your ladder to success in education depends on your daily decisions and actions both at home and in college.
    This involves regular attendance, attentiveness in class, daily study, and embracing extra reading. Remember, as Nelson
    Mandela said, “Education is the most powerful weapon which you can use to change the world.” By taking your studies
    seriously now, you lay the foundation for a future where you can live fulfilling lives and contribute significantly to
    nation-building.
  </p>
  <p>
    Furthermore, I urge you to avoid all harmful habits and to always strive to maintain a positive and supportive atmosphere
    within the college, your second home. Never hesitate to seek help in times of need, and actively participate in all college
    programs. As Albert Einstein wisely noted, “The only source of knowledge is experience.”
  </p>
  <p>
    Let us work together to make this academic journey enriching and memorable. With God’s grace and our combined efforts,
    we can create a thriving community of learners and leaders.
  </p>
  <p><strong>Blessings and best wishes,</strong></p>
  <p><strong>Yours sincerely,</strong><br />Fr Januarius S Sangma SDB<br /><strong>Principal</strong></p>
`

export default async function PrincipalMessagePage() {
  const [page, session] = await Promise.all([getPrincipalMessagePage(), getServerSession(authOptions)])

  const title = page?.published ? page.title : "Principal’s Message"
  const content = page?.published && page.content ? page.content : FALLBACK_HTML
  const photoSrc = principalPhotoSrc(page)

  return (
    <div className="bg-brand-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-2xl shadow-[#1e3a8a]/10 ring-1 ring-slate-200/80 backdrop-blur-md">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-12">
            <div className="relative bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] lg:col-span-4">
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,white,transparent_55%)]" />
              <div className="relative flex h-full flex-col items-center justify-center p-10 text-center">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-3xl bg-white/20 blur-md" />
                  <div className="relative overflow-hidden rounded-2xl ring-4 ring-white/30 shadow-xl">
                    <Image
                      src={photoSrc}
                      alt="Principal"
                      width={240}
                      height={320}
                      className="object-cover"
                      style={{ height: "auto" }}
                      priority
                      unoptimized={principalPhotoNeedsUnoptimized(photoSrc)}
                    />
                  </div>
                </div>
                <p className="mt-6 font-heading text-sm font-semibold text-white">Fr Januarius S Sangma SDB</p>
                <p className="text-sm text-white/85">Principal</p>
              </div>
            </div>

            <article className="relative p-8 sm:p-10 lg:col-span-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800 ring-1 ring-amber-500/25">
                <Quote className="h-3.5 w-3.5" aria-hidden />
                Principal&apos;s Message
              </div>

              <h1 className="font-heading text-2xl font-bold text-slate-900 md:text-3xl">{title}</h1>

              {!page?.published ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  This page is showing default content. To update it, create/publish a page in Admin → Pages with slug{" "}
                  <span className="font-mono">principal-message</span>. Set <strong>Featured image</strong> there to
                  change the portrait photo.
                </div>
              ) : null}

              {session && page?.id ? (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <span className="font-medium text-slate-800">Admin:</span> update the message and principal photo in{" "}
                  <Link href={`/admin/pages/${page.id}`} className="font-semibold text-[#1E3A8A] underline-offset-2 hover:underline">
                    Edit this page
                  </Link>
                  .
                </div>
              ) : null}

              <div
                className="prose prose-slate mt-6 max-w-none prose-headings:font-heading prose-p:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content }}
                suppressHydrationWarning
              />
            </article>
          </div>
        </div>
      </div>
    </div>
  )
}

