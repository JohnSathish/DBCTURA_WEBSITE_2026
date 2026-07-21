"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import { LogOut, Pencil } from "lucide-react"

type AdminEditNoticeProps = {
  pageId: string
  email?: string | null
}

export function AdminEditNotice({ pageId, email }: AdminEditNoticeProps) {
  return (
    <div className="mt-5 flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-slate-900">Admin preview</p>
        <p className="mt-0.5 text-xs text-slate-600">
          Only signed-in administrators can see this panel
          {email ? ` · ${email}` : ""}.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={`/admin/pages/${pageId}`}
          className="inline-flex items-center gap-1.5 font-semibold text-[#1E3A8A] underline-offset-2 hover:underline"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden />
          Edit page
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/principal-message" })}
          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-950"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden />
          Sign out
        </button>
      </div>
    </div>
  )
}
