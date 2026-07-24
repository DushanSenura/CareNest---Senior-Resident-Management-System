import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ResidentStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateResidentDto, ResidentQueryDto } from './dto';

@Injectable()
export class ResidentsService {
  constructor(private readonly prisma: PrismaService) {}

  list(query: ResidentQueryDto, linkedResidentId?:string) {
    const where: Prisma.ResidentWhereInput = {
      status: query.status,
      ...(linkedResidentId?{id:linkedResidentId}:{}),
      ...(query.search ? { OR: [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { room: { contains: query.search, mode: 'insensitive' } },
      ] } : {}),
    };
    return this.prisma.resident.findMany({ where, orderBy: { lastName: 'asc' }, include: { medications: { where: { active: true } }, admissionProfile: { select: { admissionId: true, admissionStatus: true } } } });
  }

  async get(id: string) {
    const resident = await this.prisma.resident.findUnique({
      where: { id },
      include: { admissionProfile: true, carePlans: true, medications: true, tasks: { orderBy: { dueAt: 'asc' } }, incidents: { orderBy: { occurredAt: 'desc' } }, observations: { orderBy: { recordedAt: 'desc' }, take: 10 } },
    });
    if (!resident) throw new NotFoundException('Resident not found');
    return resident;
  }

  async updateStatus(id: string, status: ResidentStatus) {
    await this.get(id);
    return this.prisma.resident.update({
      where: { id },
      data: { status },
      include: { admissionProfile: { select: { admissionId: true, admissionStatus: true } } },
    });
  }

  async create(dto: CreateResidentDto) {
    const {
      admissionData = {}, admissionTime, admissionType, admissionStatus, branch, building, floor,
      expectedLengthOfStay, referralSource, admissionOfficer, careManager, primaryCaregiver, ...resident
    } = dto;
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 1);
    const sequence = await this.prisma.admissionProfile.count({ where: { createdAt: { gte: start } } }) + 1;
    const admissionId = `ADM-${today.getFullYear()}-${String(sequence).padStart(5, '0')}`;
    const section = (key: string, fallback: object | unknown[] = {}) =>
      (admissionData[key] ?? fallback) as Prisma.InputJsonValue;
    return this.prisma.resident.create({
      data: {
        ...resident,
        dateOfBirth: new Date(resident.dateOfBirth),
        admissionDate: new Date(resident.admissionDate),
        admissionProfile: { create: {
          admissionId,
          admissionDate: new Date(resident.admissionDate),
          admissionTime: admissionTime ?? today.toTimeString().slice(0, 5),
          admissionType: admissionType ?? 'PERMANENT_RESIDENCE',
          admissionStatus: admissionStatus ?? 'DRAFT',
          branch, building, floor, expectedLengthOfStay, referralSource,
          admissionOfficer, careManager, primaryCaregiver,
          personalInformation: section('personalInformation'),
          contacts: section('contacts', []),
          guardianLegal: section('guardianLegal'),
          medicalInformation: section('medicalInformation'),
          allergies: section('allergies', []),
          medicationInformation: section('medicationInformation', []),
          mobilityAssistance: section('mobilityAssistance'),
          dailyLiving: section('dailyLiving'),
          cognitiveMentalHealth: section('cognitiveMentalHealth'),
          communicationSensory: section('communicationSensory'),
          nutritionDietary: section('nutritionDietary'),
          continenceToileting: section('continenceToileting'),
          personalCare: section('personalCare'),
          socialLifestyle: section('socialLifestyle'),
          behaviourSafety: section('behaviourSafety'),
          accommodation: section('accommodation'),
          financialBilling: section('financialBilling'),
          admissionAssessment: section('admissionAssessment'),
          requiredServices: section('requiredServices'),
          documentsUploads: section('documentsUploads', []),
        } },
      },
      include: { admissionProfile: true },
    });
  }
}
