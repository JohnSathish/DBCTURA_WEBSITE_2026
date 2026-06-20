import Link from "next/link"
import Image from "next/image"
import { Quote } from "lucide-react"
import {
  getPrincipalMessagePage,
  principalPhotoNeedsUnoptimized,
  principalPhotoSrc,
} from "@/lib/principal-message"

function htmlToText(html: string) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export default async function PrincipalMessagePremium() {
  const page = await getPrincipalMessagePage()

  const fullText = page?.published && page.content ? htmlToText(page.content) : ""
  const photoSrc = principalPhotoSrc(page)
  const preview =
    fullText.length > 0
      ? fullText.slice(0, 360) + (fullText.length > 360 ? "…" : "")
      : ""

  return (
    <section className="relative py-12 md:py-16">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#F8FAFC] via-white to-[#F8FAFC]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-2xl shadow-[#1e3a8a]/10 ring-1 ring-slate-200/80 backdrop-blur-md">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-12">
            <div className="relative min-h-[280px] bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] lg:col-span-4">
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,white,transparent_55%)]" />
              <div className="relative flex h-full flex-col items-center justify-center p-8 text-center">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-3xl bg-white/20 blur-md" />
                  <div className="relative overflow-hidden rounded-2xl ring-4 ring-white/30 shadow-xl">
                    <Image
                      src={photoSrc}
                      alt="Fr Januarius S Sangma SDB, Principal"
                      width={220}
                      height={290}
                      className="object-cover"
                      style={{ height: "auto" }}
                      unoptimized={principalPhotoNeedsUnoptimized(photoSrc)}
                    />
                  </div>
                </div>
                <p className="mt-6 font-heading text-sm font-semibold text-white">Fr Januarius S Sangma SDB</p>
                <p className="text-sm text-white/85">Principal</p>
              </div>
            </div>

            <div className="relative p-8 sm:p-10 lg:col-span-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800 ring-1 ring-amber-500/25">
                <Quote className="h-3.5 w-3.5" aria-hidden />
                Principal&apos;s Message
              </div>
              <h2 className="font-heading text-2xl font-bold text-slate-900 md:text-3xl">A word from the Principal</h2>

              <blockquote className="mt-6 border-l-4 border-amber-500 pl-5 text-slate-700">
                <p className="font-medium text-slate-800">My dear Staff and Students,</p>
                {preview ? (
                  <p className="mt-3 leading-relaxed">{preview}</p>
                ) : (
                  <>
                    <p className="mt-3 leading-relaxed">
                      Greetings with love! I thank God for this blessed opportunity to be at Don Bosco College, Tura, and to
                      contribute to the quality education of thousands of young minds at our esteemed institution.
                    </p>
                    <p className="mt-3 leading-relaxed">
                      Together, as a unified community, we can achieve remarkable things. Remember, as Nelson Mandela said,{" "}
                      <span className="italic text-slate-900">
                        &ldquo;Education is the most powerful weapon which you can use to change the world.&rdquo;
                      </span>
                    </p>
                    <p className="mt-3 leading-relaxed">
                      Let us work together to make this academic journey enriching and memorable. Blessings and best wishes.
                    </p>
                  </>
                )}
              </blockquote>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm font-semibold text-slate-900">
                  Yours sincerely,
                  <br />
                  <span className="font-normal">Fr Januarius S Sangma SDB</span>
                </p>

                <Link
                  href="/principal-message"
                  className="inline-flex items-center justify-center rounded-xl bg-[#1E3A8A] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#2563EB] hover:shadow-lg"
                >
                  Read More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
