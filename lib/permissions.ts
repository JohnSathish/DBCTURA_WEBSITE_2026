export const PERMISSIONS = {
  SYLLABUS_VIEW: "syllabus:view",
  SYLLABUS_UPLOAD: "syllabus:upload",
  SYLLABUS_EDIT: "syllabus:edit",
  SYLLABUS_DELETE: "syllabus:delete",
  SYLLABUS_PUBLISH: "syllabus:publish",
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

const ALL_SYLLABUS = Object.values(PERMISSIONS)

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  super_admin: ALL_SYLLABUS,
  admin: ALL_SYLLABUS,
  syllabus_manager: ALL_SYLLABUS,
  editor: [
    PERMISSIONS.SYLLABUS_VIEW,
    PERMISSIONS.SYLLABUS_UPLOAD,
    PERMISSIONS.SYLLABUS_EDIT,
  ],
  viewer: [PERMISSIONS.SYLLABUS_VIEW],
}

/** Check RBAC permission; unknown roles default to full admin access for backward compatibility. */
export function hasPermission(role: string | undefined | null, permission: Permission): boolean {
  if (!role) return false
  const perms = ROLE_PERMISSIONS[role]
  if (perms) return perms.includes(permission)
  return role === "admin" || role === "super_admin"
}

export function requirePermission(role: string | undefined | null, permission: Permission): boolean {
  return hasPermission(role, permission)
}
