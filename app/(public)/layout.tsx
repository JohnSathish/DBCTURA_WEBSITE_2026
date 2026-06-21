import { Oswald, Poppins } from "next/font/google"
import StickyHeaderWrapper from "@/components/layout/StickyHeaderWrapper"
import Footer from "@/components/layout/Footer"
import PopupBanner from "@/components/layout/PopupBanner"

// Loaded only on public pages — preload disabled to avoid unused-font warnings
// (Oswald/Poppins apply via CSS variables, not on <body> directly).
const oswald = Oswald({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-oswald",
  preload: false,
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
  preload: false,
})

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className={`${oswald.variable} ${poppins.variable} flex min-h-screen flex-col overflow-x-hidden`}
      suppressHydrationWarning
    >
      <StickyHeaderWrapper />
      <main className="flex-1" suppressHydrationWarning>
        {children}
      </main>
      <Footer />
      <PopupBanner />
    </div>
  )
}
