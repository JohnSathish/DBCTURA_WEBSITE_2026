"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  Camera,
  Grid3X3,
  Home,
  ImageIcon,
  LayoutGrid,
  Rows3,
  Search,
  Sparkles,
} from "lucide-react"

export type GalleryAlbumItem = {
  id: string
  title: string
  description: string | null
  coverImage: string | null
  imageCount: number
}

type ViewMode = "grid" | "showcase" | "compact"
type SortMode = "order" | "title" | "photos"

export default function GalleryView({ albums }: { albums: GalleryAlbumItem[] }) {
  const [query, setQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [sortMode, setSortMode] = useState<SortMode>("order")

  const totalPhotos = useMemo(() => albums.reduce((sum, a) => sum + a.imageCount, 0), [albums])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = albums
    if (q) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.description?.toLowerCase().includes(q) ?? false)
      )
    }
    const sorted = [...list]
    if (sortMode === "title") sorted.sort((a, b) => a.title.localeCompare(b.title))
    else if (sortMode === "photos") sorted.sort((a, b) => b.imageCount - a.imageCount)
    return sorted
  }, [albums, query, sortMode])

  const gridClass =
    viewMode === "showcase"
      ? "grid grid-cols-1 gap-8 sm:grid-cols-2"
      : viewMode === "compact"
        ? "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        : "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"

  return (
    <div className="min-h-screen bg-brand-surface">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1E3A8A] to-[#312e81] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />
        <div className="pointer-events-none absolute -left-20 top-10 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2563EB]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" aria-hidden />
                Visual archive
              </div>
              <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">Gallery</h1>
              <p className="mt-3 text-base text-white/80 sm:text-lg">
                Explore campus life, events, and memories — browse albums with search and flexible layouts.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-md">
                  <p className="text-2xl font-bold leading-none">{albums.length}</p>
                  <p className="mt-1 text-xs text-white/65">Albums</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-md">
                  <p className="text-2xl font-bold leading-none">{totalPhotos}</p>
                  <p className="mt-1 text-xs text-white/65">Photos</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/15"
              >
                <Home className="h-4 w-4" aria-hidden />
                Go to Home
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#1E3A8A] shadow-lg shadow-black/20 transition hover:bg-white/95"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Go Back
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Controls + grid */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
        {albums.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-12 text-center shadow-xl backdrop-blur-md">
            <Camera className="mx-auto h-12 w-12 text-slate-300" aria-hidden />
            <p className="mt-4 text-lg font-medium text-slate-700">No gallery albums yet.</p>
            <p className="mt-1 text-sm text-slate-500">Albums will appear here once created from the admin panel.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-xl shadow-[#1e3a8a]/8 backdrop-blur-md ring-1 ring-slate-200/60 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search albums…"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="sr-only" htmlFor="gallery-sort">
                    Sort albums
                  </label>
                  <select
                    id="gallery-sort"
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as SortMode)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  >
                    <option value="order">Default order</option>
                    <option value="title">Title A–Z</option>
                    <option value="photos">Most photos</option>
                  </select>

                  <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                    {(
                      [
                        { id: "grid" as const, icon: LayoutGrid, label: "Grid" },
                        { id: "showcase" as const, icon: Rows3, label: "Showcase" },
                        { id: "compact" as const, icon: Grid3X3, label: "Compact" },
                      ] as const
                    ).map(({ id, icon: Icon, label }) => (
                      <button
                        key={id}
                        type="button"
                        title={label}
                        onClick={() => setViewMode(id)}
                        className={`rounded-lg p-2 transition ${
                          viewMode === id
                            ? "bg-[#1E3A8A] text-white shadow-sm"
                            : "text-slate-500 hover:bg-white hover:text-slate-800"
                        }`}
                        aria-label={label}
                        aria-pressed={viewMode === id}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center">
                <p className="font-medium text-slate-700">No albums match your search.</p>
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-3 text-sm font-semibold text-[#1E3A8A] hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className={gridClass}>
                {filtered.map((album) => (
                  <Link
                    key={album.id}
                    href={`/gallery/albums/${album.id}`}
                    className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 rounded-2xl"
                  >
                    <article className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-500 hover:-translate-y-1.5 hover:border-cyan-400/40 hover:shadow-2xl hover:shadow-[#1e3a8a]/15">
                      <div
                        className={`relative overflow-hidden bg-slate-900 ${
                          viewMode === "showcase" ? "aspect-[16/10]" : viewMode === "compact" ? "aspect-square" : "aspect-[4/3]"
                        }`}
                      >
                        {album.coverImage ? (
                          <>
                            <Image
                              src={album.coverImage}
                              alt={album.title}
                              fill
                              className="object-cover transition duration-700 group-hover:scale-110"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-80 transition group-hover:opacity-90" />
                          </>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                            <ImageIcon className="h-10 w-10 text-slate-400" aria-hidden />
                          </div>
                        )}

                        <div className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-md">
                          {album.imageCount} {album.imageCount === 1 ? "photo" : "photos"}
                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                          <h2
                            className={`font-heading font-bold text-white drop-shadow-md ${
                              viewMode === "compact" ? "text-sm line-clamp-2" : "text-lg sm:text-xl"
                            }`}
                          >
                            {album.title}
                          </h2>
                          {album.description && viewMode !== "compact" ? (
                            <p className="mt-1 line-clamp-2 text-xs text-white/80 sm:text-sm">{album.description}</p>
                          ) : null}
                        </div>

                        <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                          <div className="absolute inset-0 ring-2 ring-inset ring-cyan-300/50" />
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
