'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { Mail, Phone, MapPin, Users } from "lucide-react"

const footerLinks = {
  quickLinks: [
    { href: "/about", label: "About Us" },
    { href: "/administration", label: "Administration" },
    { href: "/academics", label: "Academics" },
    { href: "/campus", label: "Campus" },
    { href: "/admission", label: "Admission" },
  ],
  resources: [
    { href: "/student-services", label: "Student Services" },
    { href: "/clubs", label: "Clubs & Societies" },
    { href: "/downloads", label: "Downloads" },
    { href: "/gallery", label: "Gallery" },
    { href: "/news", label: "News & Events" },
  ],
  information: [
    { href: "/aqar", label: "AQAR" },
    { href: "/naac", label: "NAAC" },
    { href: "/nirf", label: "NIRF" },
    { href: "/alumni", label: "Alumni" },
  ],
}

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
    <footer className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* College Info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">
              Don Bosco College, Tura
            </h3>
            <p className="text-sm mb-4 text-white/80">
              Committed to excellence in education and holistic development of students. Empowering minds, transforming lives.
            </p>
            <div className="space-y-2 text-sm text-white/80">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Tura, Meghalaya - 794001, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:+919402152496" className="hover:text-cyan-300 transition-colors">
                  +91 9402152496
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:principal@donboscocollege.ac.in" className="hover:text-cyan-300 transition-colors break-all">
                  principal@donboscocollege.ac.in
                </a>
              </div>
              <div className="text-xs text-white/60 mt-3">
                College AISHE Code: C-16361
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/80 hover:text-cyan-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/80 hover:text-cyan-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-white font-semibold mb-4">Information</h4>
            <ul className="space-y-2">
              {footerLinks.information.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/80 hover:text-cyan-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8" suppressHydrationWarning>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/70">
            <p suppressHydrationWarning>&copy; {new Date().getFullYear()} Don Bosco College, Tura. All rights reserved.</p>
            <div className="flex flex-col md:flex-row md:items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="font-medium" suppressHydrationWarning>
                  {visitorCount !== null ? visitorCount.toLocaleString() : error ? "—" : "Counting visitors..."}
                </span>
              </div>
              <Link href="/privacy-policy" className="hover:text-cyan-300 transition-colors">Privacy Policy</Link>
              <span className="text-white/40">|</span>
              <Link href="/terms" className="hover:text-cyan-300 transition-colors">Terms & Conditions</Link>
              <span className="text-white/40">|</span>
              <Link href="/sitemap" className="hover:text-cyan-300 transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

