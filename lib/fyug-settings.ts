import { prisma } from "@/lib/prisma"

const SETTING_OPEN = "fyug_admission_open"
const SETTING_SESSION = "fyug_admission_session"
const SETTING_CLOSED_MESSAGE = "fyug_admission_closed_message"

export async function getFyugAdmissionSettings() {
  const rows = await prisma.setting.findMany({
    where: {
      key: { in: [SETTING_OPEN, SETTING_SESSION, SETTING_CLOSED_MESSAGE] },
    },
  })
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  return {
    open: map[SETTING_OPEN] !== "false",
    session: map[SETTING_SESSION] ?? "2026-2027",
    closedMessage:
      map[SETTING_CLOSED_MESSAGE] ??
      "Registration for the Fourth-Year Undergraduate Honours Programme is currently closed.",
  }
}

export async function setFyugAdmissionOpen(open: boolean) {
  await prisma.setting.upsert({
    where: { key: SETTING_OPEN },
    create: { key: SETTING_OPEN, value: open ? "true" : "false" },
    update: { value: open ? "true" : "false" },
  })
}

export async function setFyugAdmissionSession(session: string) {
  await prisma.setting.upsert({
    where: { key: SETTING_SESSION },
    create: { key: SETTING_SESSION, value: session },
    update: { value: session },
  })
}

export async function setFyugAdmissionClosedMessage(message: string) {
  await prisma.setting.upsert({
    where: { key: SETTING_CLOSED_MESSAGE },
    create: { key: SETTING_CLOSED_MESSAGE, value: message },
    update: { value: message },
  })
}
