import StickyHeaderWrapper from "@/components/layout/StickyHeaderWrapper"
import Footer from "@/components/layout/Footer"
import PopupBanner from "@/components/layout/PopupBanner"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <StickyHeaderWrapper />
      <main className="flex-1">{children}</main>
      <Footer />
      <PopupBanner />
    </div>
  )
}

