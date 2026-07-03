import {
  ADMISSION_LINKS_DEFAULTS,
  ADMISSION_SETTING_KEYS,
  normalizeAdmissionUrl,
  normalizeHeaderCtaMode,
  type AdmissionLinksConfig,
} from "./admission-links-settings"
import { prisma } from "./prisma"

export async function getAdmissionLinksConfig(): Promise<AdmissionLinksConfig> {
  const keys = Object.values(ADMISSION_SETTING_KEYS)
  const rows = await prisma.setting.findMany({ where: { key: { in: keys } } })
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  const modeRaw = map[ADMISSION_SETTING_KEYS.headerCtaMode]

  return {
    applyNowUrl: normalizeAdmissionUrl(
      map[ADMISSION_SETTING_KEYS.applyNow],
      ADMISSION_LINKS_DEFAULTS.applyNowUrl
    ),
    onlineAdmissionUrl: normalizeAdmissionUrl(
      map[ADMISSION_SETTING_KEYS.onlineAdmission],
      ADMISSION_LINKS_DEFAULTS.onlineAdmissionUrl
    ),
    prospectusUrl: normalizeAdmissionUrl(
      map[ADMISSION_SETTING_KEYS.prospectus],
      ADMISSION_LINKS_DEFAULTS.prospectusUrl
    ),
    headerCtaMode:
      modeRaw != null && String(modeRaw).trim() !== ""
        ? normalizeHeaderCtaMode(modeRaw)
        : ADMISSION_LINKS_DEFAULTS.headerCtaMode,
    fyugAdmissionUrl: normalizeAdmissionUrl(
      map[ADMISSION_SETTING_KEYS.fyugUrl],
      ADMISSION_LINKS_DEFAULTS.fyugAdmissionUrl
    ),
    fyugAdmissionLabel: normalizeAdmissionUrl(
      map[ADMISSION_SETTING_KEYS.fyugLabel],
      ADMISSION_LINKS_DEFAULTS.fyugAdmissionLabel
    ),
  }
}
