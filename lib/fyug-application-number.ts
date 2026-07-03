import { prisma } from "@/lib/prisma"
import { FYUG_APPLICATION_PREFIX } from "./fyug-admission-constants"

export async function generateFyugApplicationNumber(): Promise<string> {
  const prefix = FYUG_APPLICATION_PREFIX

  const seq = await prisma.$transaction(async (tx) => {
    const existing = await tx.fyugAdmissionSequence.findUnique({ where: { prefix } })
    if (existing) {
      return tx.fyugAdmissionSequence.update({
        where: { prefix },
        data: { lastValue: { increment: 1 } },
      })
    }
    return tx.fyugAdmissionSequence.create({
      data: { prefix, lastValue: 1 },
    })
  })

  const num = String(seq.lastValue).padStart(6, "0")
  return `${prefix}-${num}`
}
