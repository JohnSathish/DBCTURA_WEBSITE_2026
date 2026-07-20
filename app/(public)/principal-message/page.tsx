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
                <p className="mt-6 font-heading text-sm font-semibold text-white">Dr. Fr. Jogesh B. Sangma, SDB</p>
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

