import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateMedicationDto, UpdateMedicationDto } from './dto';

@Injectable()
export class MedicationsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.medication.findMany({
      orderBy: [{ active: 'desc' }, { name: 'asc' }],
      include: { resident: { select: { id: true, firstName: true, lastName: true, preferredName: true, room: true, status: true } } },
    });
  }

  async get(id: string) {
    const medication = await this.prisma.medication.findUnique({
      where: { id },
      include: { resident: { select: { id: true, firstName: true, lastName: true, preferredName: true, room: true, status: true } } },
    });
    if (!medication) throw new NotFoundException('Medication not found');
    return medication;
  }

  async create(dto: CreateMedicationDto) {
    const resident = await this.prisma.resident.findUnique({ where: { id: dto.residentId }, select: { id: true } });
    if (!resident) throw new NotFoundException('Resident not found');
    return this.prisma.medication.create({
      data: this.data(dto) as Prisma.MedicationUncheckedCreateInput,
      include: { resident: { select: { id: true, firstName: true, lastName: true, preferredName: true, room: true, status: true } } },
    });
  }

  async update(id: string, dto: UpdateMedicationDto) {
    await this.get(id);
    return this.prisma.medication.update({
      where: { id }, data: this.data(dto) as Prisma.MedicationUncheckedUpdateInput,
      include: { resident: { select: { id: true, firstName: true, lastName: true, preferredName: true, room: true, status: true } } },
    });
  }

  private data(dto: UpdateMedicationDto) {
    return {
      ...dto,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : dto.endsAt === '' ? null : undefined,
      expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : dto.expiryDate === '' ? null : undefined,
    };
  }
}
