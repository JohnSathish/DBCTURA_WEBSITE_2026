import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import PerfMeasureGuard from "@/components/PerfMeasureGuard"
import { getSiteUrl } from "@/lib/site"

const siteUrl = getSiteUrl()

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Don Bosco College, Tura",
    template: "%s | Don Bosco College, Tura",
  },
  description: "Don Bosco College, Tura - Official Website. Affiliated to NEHU. NAAC accredited institution in Meghalaya.",
  manifest: "/manifest.webmanifest",
  applicationName: "Don Bosco College, Tura",
  icons: {
    icon: [{ url: "/logo.png" }],
    apple: [{ url: "/logo.png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Don Bosco College, Tura",
    title: "Don Bosco College, Tura",
    description: "Official website of Don Bosco College, Tura — Pursuit of Excellence.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Don Bosco College, Tura",
    description: "Official website of Don Bosco College, Tura.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: "#1E3A8A",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} ${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <PerfMeasureGuard />
          {children}
        </Providers>
      </body>
    </html>
  )
}
