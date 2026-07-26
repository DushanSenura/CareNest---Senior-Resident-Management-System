export const STAFF_ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  GUEST: 'Guest',
  CARE_MANAGER: 'Care Manager',
  CAREGIVER: 'Caregiver',
  NURSE: 'Nurse',
  DOCTOR: 'Doctor',
  HR_MANAGER: 'HR Manager',
} as const;

export type StaffRole = keyof typeof STAFF_ROLES;

export const ROLE_PERMISSIONS: Record<StaffRole, string[]> = {
  SUPER_ADMIN: [
    '*',
  ],
  ADMIN: [
    'dashboard.view', 'residents.manage', 'admissions.manage', 'care_plans.manage',
    'medications.manage', 'tasks_shifts.manage', 'staff.manage', 'daily_health.manage',
    'schedule.manage', 'reports.view', 'branches.manage', 'announcements.manage',
    'audit_logs.view', 'billing.manage', 'accounts.manage', 'messages.manage',
  ],
  GUEST: ['linked_resident.view'],
  CARE_MANAGER: [
    'residents.view', 'care_plans.view', 'medications.view', 'daily_health.create',
    'daily_health.view_submitted', 'schedule.view', 'announcements.view',
    'messages.use', 'settings.manage',
  ],
  CAREGIVER: [
    'residents.view', 'care_plans.view', 'medications.view', 'daily_health.create',
    'daily_health.view_submitted', 'schedule.view', 'announcements.view',
    'messages.use', 'settings.manage',
  ],
  NURSE: [
    'residents.view', 'care_plans.view', 'medications.manage', 'daily_health.view_drafts',
    'daily_health.view_submitted', 'schedule.view', 'announcements.view',
    'messages.use', 'settings.manage',
  ],
  DOCTOR: [
    'residents.view', 'care_plans.view', 'medications.manage', 'daily_health.view_drafts',
    'daily_health.view_submitted', 'schedule.view', 'announcements.view',
    'messages.use', 'settings.manage',
  ],
  HR_MANAGER: [
    'residents.view', 'care_plans.view', 'medications.manage', 'daily_health.create',
    'daily_health.view_drafts', 'daily_health.view_submitted', 'schedule.view',
    'announcements.view', 'messages.use', 'settings.manage', 'staff.manage',
    'accounts.manage',
  ],
};

export function roleKey(role: string): StaffRole | undefined {
  return (Object.entries(STAFF_ROLES).find(([, label]) => label === role)?.[0]) as StaffRole | undefined;
}
