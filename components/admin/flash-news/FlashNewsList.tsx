"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Edit, FileText, ImageIcon, Megaphone } from "lucide-react"
import { DeleteFlashNewsButton } from "@/components/admin/flash-news/DeleteFlashNewsButton"
import {
  adminCellActions,
  adminCellClamp,
  adminCellWrap,
} from "@/components/admin/admin-table-classes"

export interface FlashNewsListItem {
  id: string
  title: string
  description?: string | null
  file?: string | null
  fileType?: string | null
  published: boolean
  displayOrder: number
  downloadCount?: number
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        published ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
      }`}
    >
      {published ? "Published" : "Draft"}
    </span>
  )
}

function FileBadge({ file, fileType }: { file?: string | null; fileType?: string | null }) {
  if (!file) {
    return <span className="text-xs text-slate-400">No file</span>
  }

  const isPdf = fileType === "pdf"
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
      {isPdf ? <FileText className="h-3 w-3" aria-hidden /> : <ImageIcon className="h-3 w-3" aria-hidden />}
      {isPdf ? "PDF" : "Image"}
    </span>
  )
}

function RowActions({ id }: { id: string }) {
  return (
    <div className="flex shrink-0 items-center justify-end gap-1.5">
      <Link href={`/admin/flash-news/${id}`}>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0" aria-label="Edit flash news">
          <Edit className="h-4 w-4" />
        </Button>
      </Link>
      <DeleteFlashNewsButton flashNewsId={id} />
    </div>
  )
}

export default function FlashNewsList({ items }: { items: FlashNewsListItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
        <Megaphone className="mx-auto mb-3 h-10 w-10 text-slate-300" aria-hidden />
        <p className="text-sm font-medium text-slate-600">No flash news items yet.</p>
        <p className="mt-1 text-sm text-slate-500">Create your first announcement for the homepage ticker.</p>
      </div>
    )
  }

  return (
    <>
      {/* Mobile & tablet: card list */}
      <ul className="space-y-3 md:hidden">
        {items.map((item) => (
          <li
            key={item.id}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/flash-news/${item.id}`}
                  className="block text-sm font-semibold leading-snug text-slate-900 hover:text-indigo-700 break-words [overflow-wrap:anywhere]"
                  title={item.title}
                >
                  {item.title}
                </Link>
                {item.description ? (
                  <p
                    className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600 break-words [overflow-wrap:anywhere]"
                    title={item.description}
                  >
                    {item.description}
                  </p>
                ) : null}
              </div>
              <StatusBadge published={item.published} />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <FileBadge file={item.file} fileType={item.fileType} />
                {item.fileType === "pdf" && (item.downloadCount ?? 0) > 0 ? (
                  <span className="text-xs text-slate-500">{item.downloadCount} downloads</span>
                ) : null}
              </div>
              <RowActions id={item.id} />
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: constrained table */}
      <div className="admin-table-shell hidden md:block">
        <table className="admin-data-table w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b bg-slate-50/80">
              <th className="h-11 w-[42%] px-3 text-left align-middle text-xs font-semibold uppercase tracking-wide text-slate-500">
                Title
              </th>
              <th className="hidden h-11 w-[28%] px-3 text-left align-middle text-xs font-semibold uppercase tracking-wide text-slate-500 lg:table-cell">
                Description
              </th>
              <th className="h-11 w-[10%] px-3 text-left align-middle text-xs font-semibold uppercase tracking-wide text-slate-500">
                File
              </th>
              <th className="h-11 w-[8%] px-3 text-left align-middle text-xs font-semibold uppercase tracking-wide text-slate-500">
                Downloads
              </th>
              <th className="h-11 w-[10%] px-3 text-left align-middle text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>
              <th className={`h-11 px-3 ${adminCellActions}`}>Actions</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {items.map((item) => (
              <tr key={item.id} className="border-b transition-colors hover:bg-slate-50/60">
                <td className={`px-3 py-3.5 ${adminCellWrap}`}>
                  <Link
                    href={`/admin/flash-news/${item.id}`}
                    className="line-clamp-3 font-medium leading-snug text-slate-900 hover:text-indigo-700"
                    title={item.title}
                  >
                    {item.title}
                  </Link>
                </td>
                <td className={`hidden px-3 py-3.5 lg:table-cell ${adminCellClamp}`}>
                  {item.description ? (
                    <p className="line-clamp-2 text-sm leading-relaxed text-slate-600" title={item.description}>
                      {item.description}
                    </p>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </td>
                <td className="px-3 py-3.5 align-middle">
                  <FileBadge file={item.file} fileType={item.fileType} />
                </td>
                <td className="px-3 py-3.5 align-middle text-sm text-slate-600">
                  {item.fileType === "pdf" ? (item.downloadCount ?? 0).toLocaleString() : "—"}
                </td>
                <td className="px-3 py-3.5 align-middle">
                  <StatusBadge published={item.published} />
                </td>
                <td className={`px-3 py-3.5 ${adminCellActions}`}>
                  <RowActions id={item.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
