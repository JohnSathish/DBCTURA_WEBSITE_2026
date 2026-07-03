/** FYUG admission portal design tokens */
export const fyug = {
  primary: "#0F4C81",
  secondary: "#2563EB",
  accent: "#F59E0B",
  success: "#10B981",
  danger: "#EF4444",
  bg: "#F8FAFC",
  border: "#DCE3EC",
} as const

/** Compact control height — matches standard form inputs (~36px) */
export const FYUG_INPUT_HEIGHT = "h-9"

/** 8px gap between label and control */
export const FYUG_LABEL_GAP = "space-y-2"

/** ~20px gap between field groups */
export const FYUG_FIELD_GAP = "space-y-5"

export const sectionIcons = {
  personal: "User",
  parents: "Users",
  college: "School",
  academic: "GraduationCap",
  backpapers: "FileWarning",
  declaration: "PenLine",
} as const
