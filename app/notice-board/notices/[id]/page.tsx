import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import BreadcrumbTitleSetter from "@/components/layout/BreadcrumbTitleSetter"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Eye, FileText, ImageIcon, Pin, Type, AlertCircle, Home } from "lucide-react"

function TypeIcon({ type }: { type: string }) {
  const t = (type || "text").toLowerCase()
  const Icon = t === "document" ? FileText : t === "image" ? ImageIcon : Type
  const label = t === "document" ? "PDF" : t === "image" ? "Image" : "Text"
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
      <Icon className="h-4 w-4" />
      {label}
    </span>
  )
}

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const notice = await prisma.noticeBoardNotice.findUnique({ where: { id } })
  if (!notice) notFound()

  const now = new Date()
  if (!notice.active || notice.publishDate > now || (notice.expiryDate && notice.expiryDate <= now)) {
    notFound()
  }

  const publish = new Date(notice.publishDate)
  const expiry = notice.expiryDate ? new Date(notice.expiryDate) : null

  return (
    <div className="min-h-screen bg-brand-surface py-8 md:py-12">
      <BreadcrumbTitleSetter title={notice.title} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/notice-board"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-text hover:text-brand-hover"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Notice Board
          </Link>
          <span className="text-slate-300">|</span>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-text hover:text-brand-hover">
            <Home className="h-4 w-4" />
            Home
          </Link>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5 overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
            <div className="flex flex-wrap items-center gap-2">
              <TypeIcon type={notice.noticeType} />
              {notice.pinned ? (
                <Badge className="bg-blue-50 text-blue-700 border-blue-100">
                  <Pin className="h-3.5 w-3.5 mr-1" /> Pinned
                </Badge>
              ) : null}
              {notice.important ? (
                <Badge className="bg-red-50 text-red-700 border-red-100">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  Important
                </Badge>
              ) : null}
            </div>

            <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {notice.title}
            </h1>
            <div className="mt-2 text-sm text-slate-600">
              Published {publish.toLocaleDateString()}
              {expiry ? ` • Expires ${expiry.toLocaleDateString()}` : ""}
            </div>
          </div>

          <div className="px-6 py-6">
            {notice.noticeType === "document" && notice.pdfUrl ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <FileText className="h-10 w-10 shrink-0 text-red-500" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">PDF Document</p>
                    <p className="truncate text-sm text-slate-600">{notice.pdfUrl.split("/").pop()}</p>
                    {notice.downloadCount > 0 ? (
                      <p className="mt-1 text-xs text-slate-500">
                        Downloaded {notice.downloadCount.toLocaleString()} time
                        {notice.downloadCount === 1 ? "" : "s"}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/api/notice-board/notices/${notice.id}/download`}>
                      <Button className="rounded-xl bg-blue-600 shadow-sm shadow-blue-600/20 hover:bg-blue-700">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    </Link>
                    <Link href={`/api/notice-board/notices/${notice.id}/download?inline=1`} target="_blank" rel="noreferrer">
                      <Button variant="outline" className="rounded-xl">
                        <Eye className="mr-2 h-4 w-4" />
                        View PDF
                      </Button>
                    </Link>
                  </div>
                </div>
                <p className="text-sm text-slate-600">If your browser doesn’t preview PDFs, use Download.</p>
              </div>
            ) : null}

            {notice.noticeType === "image" && notice.imageUrl ? (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={notice.imageUrl}
                      alt={notice.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 100vw, 64rem"
                    />
                  </div>
                </div>
                <Link href={notice.imageUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="rounded-xl">
                    <Eye className="h-4 w-4 mr-2" />
                    Open image
                  </Button>
                </Link>
              </div>
            ) : null}

            {notice.noticeType === "text" ? (
              <div
                className="prose max-w-none prose-a:text-blue-700 prose-a:font-semibold prose-img:rounded-xl prose-img:border prose-img:border-slate-200"
                dangerouslySetInnerHTML={{ __html: notice.content || "" }}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

