import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCarePlanDto } from './dto';

@Injectable()
export class CarePlansService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.carePlan.findMany({
      orderBy: [{ reviewDate: 'asc' }, { updatedAt: 'desc' }],
      include: {
        resident: {
          select: { id: true, firstName: true, lastName: true, preferredName: true, room: true, status: true },
        },
      },
    });
  }

  async create(dto: CreateCarePlanDto) {
    const resident = await this.prisma.resident.findUnique({ where: { id: dto.residentId }, select: { id: true } });
    if (!resident) throw new NotFoundException('Resident not found');
    return this.prisma.carePlan.create({
      data: { ...dto, reviewDate: new Date(dto.reviewDate) },
      include: {
        resident: {
          select: { id: true, firstName: true, lastName: true, preferredName: true, room: true, status: true },
        },
      },
    });
  }
}
