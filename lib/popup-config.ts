export const POPUP_TYPES = [
  { value: "information", label: "Information" },
  { value: "admission", label: "Admission" },
  { value: "announcement", label: "Announcement" },
  { value: "event", label: "Event" },
  { value: "notice", label: "Notice" },
] as const

export const POPUP_POSITIONS = [
  { value: "center", label: "Center" },
  { value: "top", label: "Top Center" },
  { value: "bottom", label: "Bottom Center" },
] as const

export const POPUP_SIZES = [
  { value: "small", label: "Small", className: "max-w-md" },
  { value: "medium", label: "Medium", className: "max-w-2xl" },
  { value: "large", label: "Large", className: "max-w-4xl" },
  { value: "fullscreen", label: "Full Screen", className: "max-w-[95vw] w-[95vw] h-[90vh]" },
] as const

export const AUTO_CLOSE_OPTIONS = [
  { value: 0, label: "Never" },
  { value: 5, label: "5 seconds" },
  { value: 10, label: "10 seconds" },
  { value: 15, label: "15 seconds" },
  { value: 30, label: "30 seconds" },
] as const

export type PopupType = (typeof POPUP_TYPES)[number]["value"]
export type PopupPosition = (typeof POPUP_POSITIONS)[number]["value"]
export type PopupSize = (typeof POPUP_SIZES)[number]["value"]

export function getPopupSizeClass(size: string) {
  return POPUP_SIZES.find((s) => s.value === size)?.className ?? POPUP_SIZES[1].className
}

export function getPopupPositionClass(position: string) {
  switch (position) {
    case "top":
      return "items-start pt-8"
    case "bottom":
      return "items-end pb-8"
    default:
      return "items-center"
  }
}
