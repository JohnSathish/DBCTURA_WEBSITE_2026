"use client"

import Link from "next/link"
import { Mail, Phone, Facebook, Twitter, Youtube, Instagram, MessageCircle } from "lucide-react"

export default function Topbar() {
  return (
    <div className="font-topbar border-b border-white/10 bg-[#0a1628] text-[11px] text-white/90 antialiased leading-tight sm:text-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-1 md:gap-2 py-1.5 md:py-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-0.5 md:gap-x-3 font-medium">
            <a
              href="mailto:principal@donboscocollege.ac.in"
              className="flex items-center gap-1 text-white/90 hover:text-amber-300 transition-colors"
            >
              <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" strokeWidth={2} />
              <span className="hidden sm:inline">principal@donboscocollege.ac.in</span>
              <span className="sm:hidden">principal@...</span>
            </a>
            <span className="hidden md:inline text-white/30 select-none">|</span>
            <a href="tel:+919402152496" className="flex items-center gap-1 text-white/90 hover:text-amber-300 transition-colors">
              <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" strokeWidth={2} />
              <span>+91 9402152496</span>
            </a>
            <span className="hidden lg:inline text-white/30 select-none">|</span>
            <span className="hidden lg:inline text-white/75">College AISHE Code: C-16361</span>
            <span className="hidden md:inline text-white/30 select-none">|</span>
            <Link href="/career-placement" className="text-white/90 hover:text-amber-300 transition-colors">
              Career &amp; Placement Cell
            </Link>
            <span className="hidden md:inline text-white/30 select-none">|</span>
            <Link href="/blood-donors" className="text-white/90 hover:text-amber-300 transition-colors">
              DBC Blood Donors
            </Link>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 text-white/90">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:text-amber-300 rounded-full transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
            </a>
            <a
              href="https://www.twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:text-amber-300 rounded-full transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
            </a>
            <a
              href="https://wa.me/919402152496"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:text-amber-300 rounded-full transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
            </a>
            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:text-amber-300 rounded-full transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:text-amber-300 rounded-full transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
