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
  <p><strong>Dear Staff and Students,</strong></p>
  <p>Warm greetings from Don Bosco College, Tura.</p>
  <p>
    True to its motto, &ldquo;In Pursuit of Excellence,&rdquo; Don Bosco College has been striving relentlessly for the last
    39 years to prepare competent and socially committed young people so that they can take &ldquo;their rightful place
    in society.&rdquo; No doubt, higher education is the engine of human civilization. It drives societal progress, powers
    the global economy through research and innovation, and instils critical thinking and cultural awareness needed to
    navigate a complex world.
  </p>
  <p>
    My dear students, today you are in the lap of such a higher educational institution, and with the introduction of the
    NEP Curriculum, you are being given a greater opportunity to equip yourselves with the knowledge and skills required
    to face the challenges of the world. Hence, seize every opportunity to enter the library and lecture hall, and engage
    in serious research, analytical thinking, dialogue, and debate. However, such academic pursuits require hard work,
    sacrifice, discipline, serious thinking, and reflection. It is a struggle indeed. But remember what the Greek
    philosopher Aristotle said: &ldquo;The roots of education are bitter, but the fruit is sweet.&rdquo;
  </p>
  <p>
    Once you are engaged in such an academic pursuit with honesty and sincerity, why should you not clear competitive
    examinations such as CUET, CAT, SSC, CGL, IIT JAM, UPSC, MPSC, ACS, Banking, and other related examinations? After the
    completion of your studies, why should you not be a preferred candidate for employment or for higher studies?
  </p>
  <p>The ball is in your court. Therefore,</p>
  <p>
    <em>
      &ldquo;Study while others are sleeping;<br />
      work while others are loafing;<br />
      prepare while others are playing;<br />
      and dream while others are wishing.&rdquo;
    </em>
  </p>
  <p>(William Arthur Ward).</p>
  <p><strong>Dr. Fr. Jogesh B. Sangma, SDB</strong><br /><strong>Principal</strong></p>
`

export default async function PrincipalMessagePage() {
  const [page, session] = await Promise.all([getPrincipalMessagePage(), getServerSession(authOptions)])

  const title = page?.published ? page.title : "Principal’s Message"
  const content = page?.published && page.content ? page.content : FALLBACK_HTML
  const photoSrc = principalPhotoSrc(page)

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-blue-50 to-transparent" />
      <div className="pointer-events-none absolute -left-32 top-36 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-20 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_24px_70px_-20px_rgba(30,58,138,0.25)] ring-1 ring-slate-200/70">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-12">
            <aside className="relative overflow-hidden bg-gradient-to-br from-[#172f72] via-[#1E3A8A] to-[#2563EB] lg:col-span-4">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.25),transparent_42%)]" />
              <div className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full border-[42px] border-white/5" />
              <Quote className="absolute right-8 top-8 h-20 w-20 text-white/10" aria-hidden />

              <div className="relative flex h-full min-h-[470px] flex-col items-center justify-center px-8 py-12 text-center lg:sticky lg:top-8 lg:min-h-[680px] lg:px-10">
                <p className="mb-7 text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
                  Office of the Principal
                </p>

                <div className="relative w-full max-w-[300px]">
                  <div className="absolute -inset-3 rounded-[1.75rem] bg-white/15 blur-xl" />
                  <div className="relative overflow-hidden rounded-[1.5rem] border border-white/40 bg-white/10 p-1.5 shadow-2xl">
                    <Image
                      src={photoSrc}
                      alt="Dr. Fr. Jogesh B. Sangma, SDB, Principal"
                      width={317}
                      height={378}
                      className="aspect-[317/378] w-full rounded-[1.15rem] object-cover"
                      priority
                      unoptimized={principalPhotoNeedsUnoptimized(photoSrc)}
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <p className="font-heading text-lg font-bold leading-snug text-white">
                    Dr. Fr. Jogesh B. Sangma, SDB
                  </p>
                  <div className="mx-auto my-3 h-px w-12 bg-amber-300/80" />
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-100">Principal</p>
                </div>

                <p className="mt-8 max-w-xs text-sm italic leading-relaxed text-blue-100/90">
                  “In Pursuit of Excellence”
                </p>
              </div>
            </aside>

            <article className="relative p-6 sm:p-10 lg:col-span-8 lg:p-14 xl:p-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-amber-800 ring-1 ring-amber-200">
                <Quote className="h-4 w-4" aria-hidden />
                Principal&apos;s Message
              </div>

              <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {title}
              </h1>
              <div className="mt-5 flex items-center gap-3" aria-hidden>
                <span className="h-1 w-12 rounded-full bg-amber-500" />
                <span className="h-1 w-5 rounded-full bg-blue-700" />
              </div>

              {!page?.published ? (
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  This page is showing default content. To update it, create/publish a page in Admin → Pages with slug{" "}
                  <span className="font-mono">principal-message</span>. Set <strong>Featured image</strong> there to
                  change the portrait photo.
                </div>
              ) : null}

              {session && page?.id ? (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-slate-700">
                  <span className="font-medium text-slate-800">Admin:</span> update the message and principal photo in{" "}
                  <Link
                    href={`/admin/pages/${page.id}`}
                    className="font-semibold text-[#1E3A8A] underline-offset-2 hover:underline"
                  >
                    Edit this page
                  </Link>
                </div>
              ) : null}

              <div
                className="mt-8 max-w-none text-[1.02rem] text-slate-700
                  [&_p]:mb-5 [&_p]:leading-8
                  [&_p:first-child]:mb-2 [&_p:first-child]:font-heading [&_p:first-child]:text-xl [&_p:first-child]:font-bold [&_p:first-child]:text-slate-950
                  [&_p:nth-child(2)]:font-medium [&_p:nth-child(2)]:text-[#1E3A8A]
                  [&_strong]:font-semibold [&_strong]:text-slate-950
                  [&_em]:font-heading [&_em]:text-lg [&_em]:font-semibold [&_em]:leading-8 [&_em]:text-[#1E3A8A]
                  [&_p:last-child]:mt-10 [&_p:last-child]:mb-0 [&_p:last-child]:border-t [&_p:last-child]:border-slate-200 [&_p:last-child]:pt-6"
                dangerouslySetInnerHTML={{ __html: content }}
                suppressHydrationWarning
              />
            </article>
          </div>
        </div>
      </div>
    </main>
  )
}

