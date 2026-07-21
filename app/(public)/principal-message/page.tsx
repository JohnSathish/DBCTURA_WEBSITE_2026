import Image from "next/image"
import { getServerSession } from "next-auth"
import { AdminEditNotice } from "@/components/principal-message/AdminEditNotice"
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
    <main className="min-h-screen bg-slate-50">
      <article className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-[900px] px-5 py-12 duration-700 sm:px-8 sm:py-16 lg:px-0 lg:py-20">
        <header className="grid items-center gap-9 border-b border-slate-200 pb-10 md:grid-cols-[1fr_260px] md:gap-14">
          <figure className="order-first mx-auto md:order-last">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_14px_35px_-18px_rgba(15,23,42,0.45)]">
              <Image
                src={photoSrc}
                alt="Dr. Fr. Jogesh B. Sangma, SDB, Principal"
                width={260}
                height={320}
                className="aspect-[13/16] w-[230px] rounded-xl object-cover md:w-[260px]"
                priority
                unoptimized={principalPhotoNeedsUnoptimized(photoSrc)}
              />
            </div>
            <figcaption className="sr-only">Dr. Fr. Jogesh B. Sangma, SDB, Principal</figcaption>
          </figure>

          <div className="text-center md:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1E3A8A]">Office of the Principal</p>
            <h1 className="mt-4 font-heading text-4xl font-bold leading-tight tracking-tight text-[#111827] sm:text-5xl">
              {title}
            </h1>
            <div className="mx-auto mt-6 h-1 w-14 rounded-full bg-amber-500 md:mx-0" aria-hidden />
            <p className="mt-6 text-lg font-semibold text-slate-900">Dr. Fr. Jogesh B. Sangma, SDB</p>
            <p className="mt-1 text-base text-slate-600">Principal</p>
          </div>
        </header>

        {!page?.published ? (
          <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This page is showing default content. To update it, create/publish a page in Admin → Pages with slug{" "}
            <span className="font-mono">principal-message</span>. Set <strong>Featured image</strong> there to change the
            portrait photo.
          </div>
        ) : null}

        {session && page?.id ? <AdminEditNotice pageId={page.id} email={session.user?.email} /> : null}

        <section aria-label="Principal's complete message" className="mt-10">
          <div
            className="max-w-none font-serif text-[18px] leading-[1.9] tracking-[0.1px] text-[#1f2937]
              [&_p]:mb-6 [&_p]:[hyphens:auto] [&_p]:[text-align:justify]
              [&_p:first-child]:font-bold [&_p:first-child]:text-slate-950
              [&_strong]:font-bold [&_strong]:text-slate-950
              [&_blockquote]:my-7 [&_blockquote]:px-8 [&_blockquote]:text-center
              [&_blockquote]:font-semibold [&_blockquote]:text-slate-950
              [&_blockquote_p]:mb-0 [&_blockquote_p]:[text-align:center]
              [&_p:has(em)]:mx-auto [&_p:has(em)]:my-7 [&_p:has(em)]:max-w-xl
              [&_p:has(em)]:font-semibold [&_p:has(em)]:text-slate-950
              [&_p:has(em)]:[text-align:center] [&_em]:font-semibold [&_em]:not-italic
              [&_p:has(em)+p]:mt-[-1rem] [&_p:has(em)+p]:[text-align:center]
              [&_p:last-child]:mb-0 [&_p:last-child]:pt-5 [&_p:last-child]:font-bold
              [&_p:last-child]:text-slate-950 [&_p:last-child]:[text-align:left]"
            dangerouslySetInnerHTML={{ __html: content }}
            suppressHydrationWarning
          />
        </section>
      </article>
    </main>
  )
}

