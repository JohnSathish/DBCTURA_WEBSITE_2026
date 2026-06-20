import Image from "next/image"

const hostelImages = [
  {
    title: "(a) Don Bosco College Boys' Hostel",
    src: "/campus/hostels/boys-hostel.jpg",
    alt: "Don Bosco College Boys' Hostel",
  },
  {
    title: "(b) Don Bosco College Boys' Hostel Annexe",
    src: "/campus/hostels/boys-hostel-annexe.jpg",
    alt: "Don Bosco College Boys' Hostel Annexe",
  },
  {
    title: "(c) Auxilium Girls' Hostel",
    src: "/campus/hostels/auxilium-girls-hostel.jpg",
    alt: "Auxilium Girls' Hostel",
  },
  {
    title: "(d) Margaret Bosco Girls' Hostel",
    src: "/campus/hostels/margaret-bosco-girls-hostel.jpg",
    alt: "Margaret Bosco Girls' Hostel",
  },
] as const

export default function CampusHostelsPage() {
  return (
    <div className="min-h-screen bg-brand-surface py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <article className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-slate-200 overflow-hidden p-8 lg:p-10">
          <h1 className="text-3xl font-semibold text-brand-text mb-6">Hostels</h1>

          <div className="prose prose-slate max-w-none text-slate-700">
            <h3 className="text-xl font-semibold text-brand-text mt-0">The College has four hostels</h3>

            <ul className="list-none pl-0 space-y-3 not-prose text-base leading-relaxed">
              <li>
                <span className="font-semibold text-brand-text">(a)</span> Don Bosco College Boys&apos; Hostel, to
                accommodate 120 boys in single and shared rooms;
              </li>
              <li>
                <span className="font-semibold text-brand-text">(b)</span> Don Bosco College Boys&apos; Hostel Annexe,
                to accommodate 30 boys in single rooms;
              </li>
              <li>
                <span className="font-semibold text-brand-text">(c)</span> Auxilium Girls&apos; Hostel, to accommodate
                90 girls in shared rooms;
              </li>
              <li>
                <span className="font-semibold text-brand-text">(d)</span> Margaret Bosco Girls&apos; Hostel, to
                accommodate 30 girls in single rooms. The respective wardens are to be approached for admission.
              </li>
            </ul>
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-2 not-prose">
            {hostelImages.map((item) => (
              <figure key={item.src} className="m-0">
                <figcaption className="mb-3 text-center text-sm font-semibold text-brand-text">{item.title}</figcaption>
                <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl border border-brand-gold/25 bg-slate-100 shadow-sm">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
              </figure>
            ))}
          </div>
        </article>
      </div>
    </div>
  )
}
