"use client"

import Link from "next/link"
import { Mail, Phone, Facebook, Twitter, Youtube, Instagram, MessageCircle } from "lucide-react"

export default function Topbar() {
  return (
    <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 text-white text-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 py-2">
          {/* Left side - Contact Info */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 text-xs md:text-sm">
            <a href="mailto:principal@donboscocollege.ac.in" className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors">
              <Mail className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">principal@donboscocollege.ac.in</span>
              <span className="sm:hidden">principal@...</span>
            </a>
            <span className="hidden md:inline text-white/50">|</span>
            <a href="tel:+919402152496" className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors">
              <Phone className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span>+91 9402152496</span>
            </a>
            <span className="hidden md:inline text-white/50">|</span>
            <span className="hidden lg:flex items-center gap-1.5">
              <span>College AISHE Code: C-16361</span>
            </span>
            <span className="hidden md:inline text-white/50">|</span>
            <Link href="/career-placement" className="hover:text-cyan-300 transition-colors">
              Career & Placement Cell
            </Link>
            <span className="hidden md:inline text-white/50">|</span>
            <Link href="/blood-donors" className="hover:text-cyan-300 transition-colors">
              DBC Blood Donors
            </Link>
          </div>

          {/* Right side - Social Media */}
          <div className="flex items-center gap-3">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4 md:h-5 md:w-5" />
            </a>
            <a
              href="https://www.twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-4 w-4 md:h-5 md:w-5" />
            </a>
            <a
              href="https://wa.me/919402152496"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
            </a>
            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="h-4 w-4 md:h-5 md:w-5" />
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4 md:h-5 md:w-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

