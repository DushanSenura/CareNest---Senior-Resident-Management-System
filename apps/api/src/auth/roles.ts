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
    'organizations.manage', 'subscriptions.manage', 'system.configure', 'branches.view_all',
    'usage.monitor', 'backups.manage', 'audit_logs.view',
  ],
  ADMIN: [
    'dashboard.view', 'residents.manage', 'admissions.manage', 'care_plans.manage',
    'medications.manage', 'tasks_shifts.manage', 'staff.manage', 'daily_health.manage',
    'schedule.manage', 'reports.view', 'branches.manage', 'announcements.manage',
    'audit_logs.view',
  ],
  GUEST: ['linked_resident.view'],
  CARE_MANAGER: [
    'residents.assess', 'care_plans.create', 'caregivers.assign', 'care_notes.review',
    'resident_progress.monitor',
  ],
  CAREGIVER: [
    'assigned_residents.view', 'meals.record', 'hygiene.record', 'mobility.record',
    'care_tasks.complete', 'daily_notes.submit', 'incidents.report',
  ],
  NURSE: [
    'vitals.record', 'medications.administer', 'medical_history.view', 'nursing_notes.add',
    'allergies.monitor', 'health_changes.report',
  ],
  DOCTOR: [
    'medical_records.view', 'diagnoses.add', 'treatment_plans.create', 'medications.prescribe',
    'laboratory_tests.request', 'health_progress.review',
  ],
  HR_MANAGER: [
    'staff.add', 'attendance.manage', 'leave.manage', 'employment_documents.manage',
    'training.monitor', 'certifications.monitor',
  ],
};

export function roleKey(role: string): StaffRole | undefined {
  return (Object.entries(STAFF_ROLES).find(([, label]) => label === role)?.[0]) as StaffRole | undefined;
}
