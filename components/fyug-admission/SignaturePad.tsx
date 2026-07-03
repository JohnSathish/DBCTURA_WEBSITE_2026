"use client"

import { useEffect, useRef } from "react"
import SignaturePadLib from "signature_pad"
import { Button } from "@/components/ui/button"

type Props = {
  onChange: (dataUrl: string | null) => void
  className?: string
}

export default function SignaturePad({ onChange, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const padRef = useRef<SignaturePadLib | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ratio = Math.max(window.devicePixelRatio || 1, 1)
    canvas.width = canvas.offsetWidth * ratio
    canvas.height = canvas.offsetHeight * ratio
    const ctx = canvas.getContext("2d")
    if (ctx) ctx.scale(ratio, ratio)

    const pad = new SignaturePadLib(canvas, { backgroundColor: "rgb(255,255,255)" })
    padRef.current = pad

    const handleEnd = () => {
      if (pad.isEmpty()) {
        onChange(null)
      } else {
        onChange(pad.toDataURL("image/png"))
      }
    }
    pad.addEventListener("endStroke", handleEnd)

    return () => {
      pad.removeEventListener("endStroke", handleEnd)
      pad.off()
    }
  }, [onChange])

  return (
    <div className={className}>
      <div className="rounded-lg border border-slate-300 bg-white overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-32 touch-none" />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => {
          padRef.current?.clear()
          onChange(null)
        }}
      >
        Clear signature
      </Button>
    </div>
  )
}
