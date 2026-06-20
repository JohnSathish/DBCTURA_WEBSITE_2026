"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ArrowRight } from "lucide-react"

type Album = {
  id: string
  title: string
  coverImage: string | null
  images: Array<{ image: string }>
}

export default function GalleryMasonry({ albums }: { albums: Album[] }) {
  const [preview, setPreview] = useState<{ src: string; title: string; id: string } | null>(null)

  if (!albums.length) {
    return (
      <section className="border-t border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 text-center text-slate-500 sm:px-6 lg:px-8">
          <p>No gallery albums available yet.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="border-t border-slate-200 bg-gradient-to-b from-white to-[#F8FAFC] py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-heading text-3xl font-bold text-slate-900 md:text-4xl">Gallery</h2>
          <p className="mt-2 text-slate-600">Moments from campus life, events, and celebrations.</p>
        </div>

        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
          {albums.map((album) => {
            const cover = album.coverImage || album.images[0]?.image || null
            return (
              <button
                key={album.id}
                type="button"
                onClick={() =>
                  cover
                    ? setPreview({ src: cover, title: album.title, id: album.id })
                    : undefined
                }
                className="group mb-4 w-full break-inside-avoid rounded-2xl border border-slate-200/80 bg-white text-left shadow-md shadow-slate-900/5 transition-all hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-slate-100">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={album.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">No image</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="px-4 py-3">
                  <p className="font-heading text-sm font-semibold text-slate-900 line-clamp-2">{album.title}</p>
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-10 text-center">
          <Button
            asChild
            className="rounded-xl bg-amber-500 px-8 py-6 text-base font-semibold text-slate-900 shadow-lg shadow-amber-500/20 hover:bg-amber-400"
          >
            <Link href="/gallery">
              View All
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-3xl border-slate-200 bg-white p-0 overflow-hidden">
          <DialogTitle className="sr-only">{preview?.title}</DialogTitle>
          {preview ? (
            <div>
              <div className="relative aspect-[16/10] w-full bg-slate-100">
                <Image src={preview.src} alt={preview.title} fill className="object-contain" sizes="100vw" />
              </div>
              <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-heading text-lg font-semibold text-slate-900">{preview.title}</p>
                <Button asChild variant="default" className="rounded-xl bg-[#1E3A8A]">
                  <Link href={`/gallery/albums/${preview.id}`}>Open album</Link>
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  )
}
