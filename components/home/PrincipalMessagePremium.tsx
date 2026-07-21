import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import {
  getPrincipalMessagePage,
  principalPhotoNeedsUnoptimized,
  principalPhotoSrc,
} from "@/lib/principal-message"

const DEFAULT_GREETING = "Warm greetings from Don Bosco College, Tura."
const DEFAULT_INTRODUCTION =
  'True to its motto, “In Pursuit of Excellence,” Don Bosco College has been striving relentlessly for the last 39 years to prepare competent and socially committed young people so that they can take “their rightful place in society.” No doubt, higher education is the engine of human civilization. It drives societal progress, powers the global economy through research and innovation, and instils critical thinking and cultural awareness needed to navigate a complex world.'
const INTRODUCTION_END = "navigate a complex world."

function htmlToText(html: string) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&ldquo;|&#8220;/gi, "“")
    .replace(/&rdquo;|&#8221;/gi, "”")
    .replace(/&rsquo;|&#8217;/gi, "’")
    .replace(/&amp;/gi, "&")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function keepMottoTogether(text: string) {
  return text.split(/([“"]In Pursuit of Excellence,[”"])/i).map((part, index) =>
    /In Pursuit of Excellence/.test(part) ? (
      <span key={index} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    ),
  )
}

function introductionFrom(fullText: string) {
  const endIndex = fullText.toLowerCase().indexOf(INTRODUCTION_END)
  if (endIndex === -1) {
    return { greeting: DEFAULT_GREETING, introduction: DEFAULT_INTRODUCTION }
  }

  const excerpt = fullText
    .slice(0, endIndex + INTRODUCTION_END.length)
    .replace(/^Dear Staff and Students,?\s*/i, "")
    .trim()
  const greetingEnd = excerpt.toLowerCase().indexOf("tura.")

  if (greetingEnd === -1) {
    return { greeting: DEFAULT_GREETING, introduction: excerpt }
  }

  return {
    greeting: excerpt.slice(0, greetingEnd + "tura.".length).trim(),
    introduction: excerpt.slice(greetingEnd + "tura.".length).trim(),
  }
}

export default async function PrincipalMessagePremium() {
  const page = await getPrincipalMessagePage()

  const fullText = page?.published && page.content ? htmlToText(page.content) : ""
  const photoSrc = principalPhotoSrc(page)
  const { greeting, introduction } = introductionFrom(fullText)

  return (
    <section aria-labelledby="principal-message-heading" className="bg-slate-50 py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <article className="animate-in fade-in slide-in-from-bottom-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.28)] duration-700">
          <div className="grid md:grid-cols-[minmax(240px,32%)_1fr]">
            <figure className="flex flex-col items-center justify-center border-b border-slate-200 bg-slate-50/70 px-7 py-9 md:border-b-0 md:border-r">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-md">
                <Image
                  src={photoSrc}
                  alt="Dr. Fr. Jogesh B. Sangma, SDB, Principal"
                  width={260}
                  height={320}
                  className="aspect-[13/16] w-[220px] rounded-lg object-cover lg:w-[240px]"
                  unoptimized={principalPhotoNeedsUnoptimized(photoSrc)}
                />
              </div>
              <figcaption className="mt-5 text-center">
                <h3 className="text-base font-semibold text-slate-900">Dr. Fr. Jogesh B. Sangma, SDB</h3>
                <p className="mt-1 text-sm text-slate-600">Principal</p>
              </figcaption>
            </figure>

            <div className="flex flex-col justify-center px-6 py-9 sm:px-9 md:px-10 lg:px-14 lg:py-12">
              <header>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1E3A8A]">
                  Principal&apos;s Message
                </p>
                <h2
                  id="principal-message-heading"
                  className="mt-3 font-heading text-3xl font-bold leading-tight tracking-tight text-[#111827] lg:text-[42px]"
                >
                  A Word from the Principal
                </h2>
              </header>

              <div className="mt-7 text-[17px] leading-[1.9] text-[#374151] lg:text-[18px]">
                <p className="mb-6 font-semibold text-slate-900">Dear Staff and Students,</p>
                <p className="mb-6 [hyphens:auto] [text-align:justify]">{greeting}</p>
                <p className="[hyphens:auto] [text-align:justify]">{keepMottoTogether(introduction)}</p>
              </div>

              <div className="mt-8 flex justify-end">
                <Link
                  href="/principal-message"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] px-8 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#172f72] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
                >
                  Read Full Message
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
