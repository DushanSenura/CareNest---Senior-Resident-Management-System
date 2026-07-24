import { CarePriority, PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/auth/password';
const prisma = new PrismaClient();

async function main() {
  const facility = await prisma.facility.upsert({
    where: { id: 'demo-facility' },
    update: {},
    create: { id: 'demo-facility', name: 'Willow Grove Residence' },
  });
  const staff = await prisma.staff.upsert({
    where: { email: 'nurse@carenest.local' },
    update: {},
    create: { facilityId: facility.id, firstName: 'Maya', lastName: 'Perera', email: 'nurse@carenest.local', role: 'Registered Nurse' },
  });
  const roleAccounts = [
    ['SA-001', 'Super', 'Administrator', 'superadmin@carenest.local', 'Super Admin', 'SuperAdmin@123'],
    ['AD-001', 'Alex', 'Administrator', 'admin@carenest.local', 'Admin', 'Admin@123'],
    ['CM-001', 'Care', 'Manager', 'caremanager@carenest.local', 'Care Manager', 'CareManager@123'],
    ['CG-001', 'Casey', 'Caregiver', 'caregiver@carenest.local', 'Caregiver', 'Caregiver@123'],
    ['NU-001', 'Nora', 'Nurse', 'nurse.account@carenest.local', 'Nurse', 'Nurse@123'],
    ['DR-001', 'Daniel', 'Doctor', 'doctor@carenest.local', 'Doctor', 'Doctor@123'],
    ['HR-001', 'Helen', 'Reid', 'hr@carenest.local', 'HR Manager', 'HRManager@123'],
  ] as const;
  for (const [employeeId, firstName, lastName, email, role, password] of roleAccounts) {
    await prisma.staff.upsert({
      where: { email },
      update: { role, employeeId, branch: 'Willow Grove Residence' },
      create: {
        facilityId: facility.id, employeeId, firstName, lastName, email, role, branch: 'Willow Grove Residence',
        department: role === 'HR Manager' ? 'Human Resources' : role === 'Super Admin' || role === 'Admin' ? 'Administration' : 'Resident Care',
        status: 'ACTIVE', passwordHash: await hashPassword(password), mustChangePassword: true,
      },
    });
  }
  const existing = await prisma.resident.findFirst({ where: { facilityId: facility.id } });
  if (!existing) {
    const resident = await prisma.resident.create({ data: {
      facilityId: facility.id, firstName: 'Eleanor', lastName: 'Bennett', preferredName: 'Ellie',
      dateOfBirth: new Date('1941-03-12'), room: 'A-104', priority: CarePriority.HIGH,
      allergies: ['Penicillin'], dietaryNeeds: ['Low sodium'], emergencyName: 'Olivia Bennett',
      emergencyPhone: '+94 77 555 0104', admissionDate: new Date('2025-02-10'),
    } });
    await prisma.careTask.create({ data: { residentId: resident.id, assigneeId: staff.id, title: 'Morning medication round', category: 'Medication', dueAt: new Date(Date.now() + 3600000) } });
    await prisma.medication.create({ data: { residentId: resident.id, name: 'Amlodipine', dosage: '5 mg', route: 'Oral', frequency: 'Once daily', startsAt: new Date() } });
  }
}
main().finally(() => prisma.$disconnect());
