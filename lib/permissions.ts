export const PERMISSIONS = {
  SYLLABUS_VIEW: "syllabus:view",
  SYLLABUS_UPLOAD: "syllabus:upload",
  SYLLABUS_EDIT: "syllabus:edit",
  SYLLABUS_DELETE: "syllabus:delete",
  SYLLABUS_PUBLISH: "syllabus:publish",
  QUESTION_PAPER_VIEW: "question_paper:view",
  QUESTION_PAPER_UPLOAD: "question_paper:upload",
  QUESTION_PAPER_EDIT: "question_paper:edit",
  QUESTION_PAPER_DELETE: "question_paper:delete",
  QUESTION_PAPER_PUBLISH: "question_paper:publish",
  QUESTION_PAPER_DOWNLOAD: "question_paper:download",
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

const ALL = Object.values(PERMISSIONS)

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  super_admin: ALL,
  admin: ALL,
  syllabus_manager: [
    PERMISSIONS.SYLLABUS_VIEW,
    PERMISSIONS.SYLLABUS_UPLOAD,
    PERMISSIONS.SYLLABUS_EDIT,
    PERMISSIONS.SYLLABUS_DELETE,
    PERMISSIONS.SYLLABUS_PUBLISH,
  ],
  question_bank_manager: [
    PERMISSIONS.QUESTION_PAPER_VIEW,
    PERMISSIONS.QUESTION_PAPER_UPLOAD,
    PERMISSIONS.QUESTION_PAPER_EDIT,
    PERMISSIONS.QUESTION_PAPER_DELETE,
    PERMISSIONS.QUESTION_PAPER_PUBLISH,
    PERMISSIONS.QUESTION_PAPER_DOWNLOAD,
  ],
  editor: [
    PERMISSIONS.SYLLABUS_VIEW,
    PERMISSIONS.SYLLABUS_UPLOAD,
    PERMISSIONS.SYLLABUS_EDIT,
    PERMISSIONS.QUESTION_PAPER_VIEW,
    PERMISSIONS.QUESTION_PAPER_UPLOAD,
    PERMISSIONS.QUESTION_PAPER_EDIT,
    PERMISSIONS.QUESTION_PAPER_DOWNLOAD,
  ],
  viewer: [PERMISSIONS.SYLLABUS_VIEW, PERMISSIONS.QUESTION_PAPER_VIEW, PERMISSIONS.QUESTION_PAPER_DOWNLOAD],
}

export function hasPermission(role: string | undefined | null, permission: Permission): boolean {
  if (!role) return false
  const perms = ROLE_PERMISSIONS[role]
  if (perms) return perms.includes(permission)
  return role === "admin" || role === "super_admin"
}

export function requirePermission(role: string | undefined | null, permission: Permission): boolean {
  return hasPermission(role, permission)
}
