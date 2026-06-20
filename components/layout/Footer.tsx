'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { Mail, Phone, MapPin, Users, Facebook, Youtube, Instagram, Linkedin } from "lucide-react"

/** Essential links only — compact footer */
const QUICK_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/administration", label: "Administration" },
  { href: "/academics", label: "Academics" },
  { href: "/campus", label: "Campus" },
  { href: "https://admissionsdbctura.com/register", label: "Online Admission" },
] as const

/** Resources + former “Information” — single list */
const RESOURCE_LINKS = [
  { href: "/student-services", label: "Student Services" },
  { href: "/clubs", label: "Clubs" },
  { href: "/downloads", label: "Downloads" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact Us" },
  { href: "/news", label: "News & Events" },
  { href: "/aqar", label: "AQAR" },
  { href: "/administration/naac", label: "NAAC" },
  { href: "/administration/nirf", label: "NIRF" },
  { href: "/administration/aishe", label: "AISHE" },
  { href: "/student-services/alumni-association", label: "Alumni" },
] as const

const linkClass =
  "text-[13px] leading-snug text-white/78 hover:text-amber-400 transition-colors block py-0.5"

export default function Footer() {
  const [visitorCount, setVisitorCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchCount() {
      try {
        const response = await fetch("/api/visitor-count", { cache: "no-store" })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load visitor count")
        }
        if (!cancelled) {
          setVisitorCount(typeof data.count === "number" ? data.count : parseInt(data.count, 10) || 0)
        }
      } catch (err: any) {
        console.error("Visitor count fetch failed:", err)
        if (!cancelled) setError(err.message)
      }
    }

    async function incrementIfNeeded() {
      try {
        const storageKey = "dbc-visitor-counted"
        const stored = window.localStorage.getItem(storageKey)
        const today = new Date().toISOString().slice(0, 10)
        if (stored !== today) {
          const response = await fetch("/api/visitor-count", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          })
          const data = await response.json()
          if (!response.ok) {
            throw new Error(data?.error || "Failed to update visitor count")
          }
          window.localStorage.setItem(storageKey, today)
          if (!cancelled) {
            setVisitorCount(typeof data.count === "number" ? data.count : parseInt(data.count, 10) || 0)
          }
        }
      } catch (err) {
        console.error("Visitor count increment failed:", err)
      }
    }

    fetchCount().then(() => incrementIfNeeded())

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <footer className="relative border-t border-white/10 bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#0f172a] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_20%_0%,rgba(245,158,11,0.12),transparent_50%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-7 lg:grid-cols-4 lg:gap-8 lg:items-start">
          {/* 1 — About */}
          <div className="min-w-0 lg:max-w-none">
            <h3 className="font-heading mb-3 text-sm font-bold uppercase tracking-wide text-white/95">
              About
            </h3>
            <p className="text-[13px] leading-snug text-white/75">
              Don Bosco College, Tura — excellence in education and holistic development for students across the
              region.
            </p>
          </div>

          {/* 2 — Quick Links */}
          <div className="font-nav min-w-0">
            <h3 className="font-heading mb-3 text-sm font-bold uppercase tracking-wide text-white/95">
              Quick Links
            </h3>
            <ul className="space-y-0.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={linkClass}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3 — Resources (incl. former Information) */}
          <div className="font-nav min-w-0">
            <h3 className="font-heading mb-3 text-sm font-bold uppercase tracking-wide text-white/95">
              Resources
            </h3>
            <ul className="space-y-0.5">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4 — Contact & Social */}
          <div className="min-w-0">
            <h3 className="font-heading mb-3 text-sm font-bold uppercase tracking-wide text-white/95">
              Contact &amp; Social
            </h3>
            <div className="space-y-2 text-[13px] leading-snug text-white/80">
              <div className="flex gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/90" aria-hidden />
                <span>Tura, Meghalaya — 794001, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-amber-400/90" aria-hidden />
                <a href="tel:+919402152496" className="hover:text-amber-400 transition-colors">
                  +91 9402152496
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/90" aria-hidden />
                <a
                  href="mailto:principal@donboscocollege.ac.in"
                  className="break-all hover:text-amber-400 transition-colors"
                >
                  principal@donboscocollege.ac.in
                </a>
              </div>
              <p className="pt-0.5 text-[11px] text-white/50">AISHE Code: C-16361</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15 transition-all hover:bg-white/20 hover:ring-amber-400/35"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15 transition-all hover:bg-white/20 hover:ring-amber-400/35"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15 transition-all hover:bg-white/20 hover:ring-amber-400/35"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15 transition-all hover:bg-white/20 hover:ring-amber-400/35"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div
          className="mt-8 border-t border-white/15 pt-6 sm:mt-7 sm:pt-6"
          suppressHydrationWarning
        >
          <div className="flex flex-col items-center justify-between gap-3 text-xs leading-snug text-white/65 sm:flex-row sm:gap-4">
            <p suppressHydrationWarning>
              &copy; {new Date().getFullYear()} Don Bosco College, Tura. All rights reserved.
            </p>
            <div className="font-nav flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-end">
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 opacity-80" aria-hidden />
                <span className="font-medium tabular-nums" suppressHydrationWarning>
                  {visitorCount !== null ? visitorCount.toLocaleString() : error ? "—" : "…"}
                </span>
              </div>
              <span className="hidden text-white/30 sm:inline" aria-hidden>
                |
              </span>
              <Link href="/privacy-policy" className="hover:text-amber-400/90 transition-colors">
                Privacy
              </Link>
              <span className="text-white/25">·</span>
              <Link href="/terms" className="hover:text-amber-400/90 transition-colors">
                Terms
              </Link>
              <span className="text-white/25">·</span>
              <Link href="/site-map" className="hover:text-amber-400/90 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
