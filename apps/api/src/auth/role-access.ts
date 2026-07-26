import { ForbiddenException } from '@nestjs/common';
import { ROLE_PERMISSIONS, roleKey } from './roles';

export const ROLES = {
  allStaff: ['Caregiver', 'Care Manager', 'Nurse', 'Doctor', 'HR Manager', 'Admin', 'Super Admin'],
  clinical: ['Nurse', 'Doctor', 'HR Manager', 'Admin', 'Super Admin'],
  careReportAuthors: ['Caregiver', 'Care Manager', 'HR Manager', 'Admin', 'Super Admin'],
  staffManagers: ['HR Manager', 'Admin', 'Super Admin'],
  administrators: ['Admin', 'Super Admin'],
} as const;

export function hasPermission(role: string, permission: string) {
  const key = roleKey(role);
  const values = key ? ROLE_PERMISSIONS[key] : [];
  return values.includes('*') || values.includes(permission);
}

export function requireRole(role: string, allowed: readonly string[]) {
  if (!allowed.includes(role)) throw new ForbiddenException('Your role does not have access to this action');
}
