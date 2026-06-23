"use client"

import type { PopupPosition, PopupSize } from "@/lib/popup-config"
import { getPopupPositionClass, getPopupSizeClass } from "@/lib/popup-config"
import { X } from "lucide-react"

type Props = {
  title: string
  content: string
  popupSize: PopupSize | string
  displayPosition: PopupPosition | string
  overlayEnabled: boolean
  previewMode?: boolean
  onClosePreview?: () => void
}

export default function PopupPreview({
  title,
  content,
  popupSize,
  displayPosition,
  overlayEnabled,
  previewMode = true,
  onClosePreview,
}: Props) {
  const sizeClass = getPopupSizeClass(String(popupSize))
  const positionClass = getPopupPositionClass(String(displayPosition))

  return (
    <div
      className={`relative min-h-[420px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 ${
        previewMode ? "" : ""
      }`}
    >
      <div
        className={`absolute inset-0 flex justify-center p-4 ${positionClass} ${
          overlayEnabled ? "bg-black/45" : "bg-transparent"
        }`}
      >
        <div
          className={`relative w-full overflow-y-auto rounded-xl bg-white shadow-2xl ${sizeClass} ${
            popupSize === "fullscreen" ? "flex flex-col" : "max-h-[85%]"
          }`}
        >
          {previewMode ? (
            <button
              type="button"
              onClick={onClosePreview}
              className="absolute right-2 top-2 z-10 rounded-full bg-white p-1.5 shadow-md hover:bg-slate-50"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Live Preview</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">{title || "Popup Title"}</h3>
          </div>
          <div
            className="popup-content prose prose-sm max-w-none p-5 sm:prose-base"
            dangerouslySetInnerHTML={{ __html: content || "<p>Start typing to preview content…</p>" }}
          />
        </div>
      </div>
    </div>
  )
}
