"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getPopupPositionClass, getPopupSizeClass } from "@/lib/popup-config"

interface Popup {
  id: string
  title: string
  content: string
  popupSize?: string
  displayPosition?: string
  overlayEnabled?: boolean
  autoCloseSeconds?: number | null
}

function getSessionId() {
  if (typeof window === "undefined") return ""
  const key = "popupSessionId"
  let id = sessionStorage.getItem(key)
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    sessionStorage.setItem(key, id)
  }
  return id
}

export default function PopupBanner() {
  const [popup, setPopup] = useState<Popup | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const trackedView = useRef(false)

  useEffect(() => {
    const closedPopupId = sessionStorage.getItem("closedPopupId")
    fetch("/api/popup")
      .then((res) => res.json())
      .then((data) => {
        if (data.popup && data.popup.id !== closedPopupId) {
          setPopup(data.popup)
          setIsVisible(true)
        }
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!popup || !isVisible || trackedView.current) return
    trackedView.current = true
    fetch(`/api/popup/${popup.id}/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "view", sessionId: getSessionId() }),
    }).catch(() => {})
  }, [popup, isVisible])

  useEffect(() => {
    if (!popup?.autoCloseSeconds || !isVisible) return
    const timer = window.setTimeout(() => {
      if (popup) {
        sessionStorage.setItem("closedPopupId", popup.id)
        fetch(`/api/popup/${popup.id}/analytics`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "close", sessionId: getSessionId() }),
        }).catch(() => {})
      }
      setIsVisible(false)
    }, popup.autoCloseSeconds * 1000)
    return () => window.clearTimeout(timer)
  }, [popup, isVisible])

  const track = (event: string) => {
    if (!popup) return
    fetch(`/api/popup/${popup.id}/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, sessionId: getSessionId() }),
    }).catch(() => {})
  }

  const handleClose = (trackClose = true) => {
    if (popup) sessionStorage.setItem("closedPopupId", popup.id)
    if (trackClose) track("close")
    setIsVisible(false)
  }

  const onContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    const anchor = target.closest("a")
    if (anchor) {
      if (anchor.classList.contains("popup-btn")) {
        track("button_click")
      } else {
        track("click")
      }
    }
  }

  const sizeClass = useMemo(
    () => getPopupSizeClass(popup?.popupSize || "medium"),
    [popup?.popupSize]
  )
  const positionClass = useMemo(
    () => getPopupPositionClass(popup?.displayPosition || "center"),
    [popup?.displayPosition]
  )

  if (!popup || !isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex justify-center p-4 ${positionClass} ${
        popup.overlayEnabled !== false ? "bg-black/50 backdrop-blur-sm" : "pointer-events-none"
      }`}
    >
      <div
        className={`relative w-full overflow-y-auto rounded-xl bg-white shadow-2xl ${sizeClass} ${
          popup.popupSize === "fullscreen" ? "h-[90vh]" : "max-h-[90vh]"
        } pointer-events-auto`}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleClose(true)}
          className="absolute right-2 top-2 z-10 rounded-full bg-white shadow-md hover:bg-slate-100"
          aria-label="Close popup"
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="p-6">
          <h2 className="mb-4 pr-10 text-2xl font-bold text-slate-900">{popup.title}</h2>
          <div
            className="popup-content prose prose-lg max-w-none"
            onClick={onContentClick}
            dangerouslySetInnerHTML={{ __html: popup.content }}
          />
        </div>
      </div>
    </div>
  )
}
