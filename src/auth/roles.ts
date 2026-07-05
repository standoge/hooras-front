import type { UserRole } from '@/api/types'

export const COORDINATOR_ROLES: UserRole[] = ['coordinator', 'admin']
export const SUPERVISOR_ROLES: UserRole[] = ['faculty_supervisor', 'external_supervisor']
export const REPORT_ROLES: UserRole[] = ['coordinator', 'admin', 'auditor']
export const MANAGEMENT_ROLES: UserRole[] = ['coordinator', 'admin']
export const ADMIN_ROLES: UserRole[] = ['admin']
export const STAFF_ROLES: UserRole[] = [
  'coordinator',
  'faculty_supervisor',
  'external_supervisor',
  'admin',
  'auditor',
]

export function hasAnyRole(userRoles: UserRole[] | undefined, allowed: UserRole[]): boolean {
  if (!userRoles?.length) return false
  return allowed.some((role) => userRoles.includes(role))
}

export function hasRole(userRoles: UserRole[] | undefined, role: UserRole): boolean {
  return userRoles?.includes(role) ?? false
}

export function isStudent(userRoles: UserRole[] | undefined): boolean {
  return hasRole(userRoles, 'student')
}

export function canManageProjects(userRoles: UserRole[] | undefined): boolean {
  return hasAnyRole(userRoles, MANAGEMENT_ROLES)
}

export function canReviewApplications(userRoles: UserRole[] | undefined): boolean {
  return hasAnyRole(userRoles, [...MANAGEMENT_ROLES, ...SUPERVISOR_ROLES])
}

export function canViewReports(userRoles: UserRole[] | undefined): boolean {
  return hasAnyRole(userRoles, REPORT_ROLES)
}

export function isManagementUser(userRoles: UserRole[] | undefined): boolean {
  return hasAnyRole(userRoles, MANAGEMENT_ROLES)
}

export function usesStudentApi(userRoles: UserRole[] | undefined): boolean {
  return isStudent(userRoles) && !hasAnyRole(userRoles, STAFF_ROLES)
}
