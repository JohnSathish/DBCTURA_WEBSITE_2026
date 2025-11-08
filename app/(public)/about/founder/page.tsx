const founderImage =
  "https://donboscocollege.ac.in/storage/file-manager/page/content/cfb95f76-dc5c-4553-ad3c-e7102b887cb3.jpg"

const paragraphs = [
  "Saint John Bosco, popularly known as Don Bosco, was a priest of the Catholic Church, who came to the rescue of the poor, disadvantaged youth of his time with his innovative method of educating them through total immersion in their world, with personal involvement in their lives and aspirations, with a dedication that was total.",
  "To ensure that his dedication to their cause shone through his actions, he lived with and for them. He based his education on the three great principles of reason, religion and loving kindness, as a caring father, doing everything possible for their welfare.",
  "The system of education that he envisioned aims to create generations of young men and women who are intellectually competent, morally upright, socially committed, spiritually inspired and devoted to their country and the world. Don Bosco is the founder of the Don Bosco Society, continues to be our inspiration.",
]

export default function FounderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <header className="text-center space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-500">His Vision …… Our Inspiration</p>
          <h1 className="text-4xl font-bold text-indigo-900">Founder: St. John Bosco</h1>
          <p className="text-base text-indigo-700">1815 – 1888</p>
        </header>

        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-indigo-100 overflow-hidden">
          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-start">
            <figure className="flex flex-col items-center gap-4">
              <div className="overflow-hidden rounded-2xl border border-indigo-100 shadow-md w-full max-w-sm">
                <img
                  src={founderImage}
                  alt="Portrait of St. John Bosco"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <figcaption className="text-center text-sm text-slate-500">
                St. John Bosco dedicated his life to empowering the young.
              </figcaption>
            </figure>

            <div className="space-y-5 text-slate-700 leading-relaxed text-lg">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="indent-6 first:indent-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


