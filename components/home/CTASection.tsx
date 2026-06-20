import Link from "next/link"
import { ArrowRight } from "lucide-react"

type Item = {
  title: string
  description: string
  href: string
  theme: "navy" | "orange"
}

const items: Item[] = [
  {
    title: "Apply Online",
    description: "ADMISSION OPEN for Academic Year 2025 - 2026",
    href: "/admissions",
    theme: "navy",
  },
  {
    title: "Prospectus",
    description:
      "Download our latest undergraduate prospectus to find out more about life at DBC, Tura.",
    href: "/downloads",
    theme: "orange",
  },
  {
    title: "Certification",
    description:
      "Elevate your skills with our most in-demand Short-Term Programmes.",
    href: "/certifications",
    theme: "navy",
  },
]

export default function CTASection() {
  return (
    <section className="-mt-6 md:-mt-10 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {items.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className={`group rounded-xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)] border transition-transform hover:-translate-y-0.5 ${
                item.theme === "navy"
                  ? "bg-brand-navy border-white/10 text-white"
                  : "bg-brand-gold border-brand-gold/50 text-brand-text"
              }`}
            >
              <div className="text-xl md:text-2xl font-semibold mb-3 tracking-wide">
                {item.title}
              </div>
              <p className="text-sm md:text-base opacity-80 leading-relaxed">
                {item.description}
              </p>
              <div className="mt-5 inline-flex items-center gap-2 text-brand-text font-medium">
                Read More
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}




