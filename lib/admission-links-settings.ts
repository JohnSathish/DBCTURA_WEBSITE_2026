export const DEFAULT_ADMISSION_EXTERNAL_URL = "https://admissionsdbctura.com/register"
export const DEFAULT_PROSPECTUS_URL = "/downloads"
export const DEFAULT_FYUG_ADMISSION_URL = "/admissions/fyug-2026"
export const DEFAULT_FYUG_ADMISSION_LABEL = "FYUG Admission 2026"

export type HeaderCtaMode = "dual" | "fyug"

export const ADMISSION_SETTING_KEYS = {
  applyNow: "admission_apply_now_url",
  onlineAdmission: "admission_online_admission_url",
  prospectus: "admission_prospectus_url",
  headerCtaMode: "admission_header_cta_mode",
  fyugUrl: "admission_fyug_url",
  fyugLabel: "admission_fyug_label",
} as const

export type AdmissionLinksConfig = {
  applyNowUrl: string
  onlineAdmissionUrl: string
  prospectusUrl: string
  headerCtaMode: HeaderCtaMode
  fyugAdmissionUrl: string
  fyugAdmissionLabel: string
}

export const ADMISSION_LINKS_DEFAULTS: AdmissionLinksConfig = {
  applyNowUrl: DEFAULT_ADMISSION_EXTERNAL_URL,
  onlineAdmissionUrl: DEFAULT_ADMISSION_EXTERNAL_URL,
  prospectusUrl: DEFAULT_PROSPECTUS_URL,
  headerCtaMode: "fyug",
  fyugAdmissionUrl: DEFAULT_FYUG_ADMISSION_URL,
  fyugAdmissionLabel: DEFAULT_FYUG_ADMISSION_LABEL,
}

export function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href.trim())
}

export function normalizeAdmissionUrl(value: unknown, fallback: string) {
  const s = String(value ?? "").trim()
  return s || fallback
}

export function normalizeHeaderCtaMode(value: unknown): HeaderCtaMode {
  return value === "fyug" ? "fyug" : "dual"
}
