"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Popup {
  id: string
  title: string
  content: string
  enabled: boolean
}

export default function PopupBanner() {
  const [popup, setPopup] = useState<Popup | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if popup was already closed in this session
    const closedPopupId = sessionStorage.getItem("closedPopupId")
    
    fetch("/api/popup")
      .then((res) => res.json())
      .then((data) => {
        if (data.popup && data.popup.id !== closedPopupId) {
          setPopup(data.popup)
          setIsVisible(true)
        }
      })
      .catch((error) => {
        console.error("Error fetching popup:", error)
      })
  }, [])

  const handleClose = () => {
    if (popup) {
      sessionStorage.setItem("closedPopupId", popup.id)
    }
    setIsVisible(false)
  }

  if (!popup || !isVisible) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 bg-white hover:bg-gray-100 rounded-full shadow-md"
          aria-label="Close popup"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">{popup.title}</h2>
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: popup.content }}
          />
        </div>
      </div>
    </div>
  )
}



