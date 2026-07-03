import { prisma } from "@/lib/prisma"

export async function logFyugAdmissionAction(params: {
  applicationId: string
  action: string
  adminUserId?: string | null
  adminEmail?: string | null
  details?: Record<string, unknown>
}) {
  await prisma.fyugAdmissionAuditLog.create({
    data: {
      applicationId: params.applicationId,
      action: params.action,
      adminUserId: params.adminUserId ?? null,
      adminEmail: params.adminEmail ?? null,
      details: params.details ? JSON.stringify(params.details) : null,
    },
  })
}
