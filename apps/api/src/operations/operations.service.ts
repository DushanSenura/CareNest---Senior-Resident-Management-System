import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateOperationalRecordDto, UpdateOperationalRecordDto } from './dto';

const MODULES = new Set([
  'schedule',
  'branches',
  'announcements',
  'audit-logs',
  'billing',
  'messages',
]);

@Injectable()
export class OperationsService {
  constructor(private readonly prisma: PrismaService) {}

  list(facilityId: string, module: string, status?: string, search?: string) {
    this.assertModule(module);
    return this.prisma.operationalRecord.findMany({
      where: {
        facilityId,
        module,
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' as const } },
                { subtitle: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      },
      orderBy: [{ eventAt: 'asc' }, { createdAt: 'desc' }],
    });
  }

  create(facilityId: string, staffId: string, module: string, dto: CreateOperationalRecordDto) {
    this.assertModule(module);
    return this.prisma.operationalRecord.create({
      data: {
        facilityId,
        createdById: staffId,
        module,
        title: dto.title.trim(),
        subtitle: dto.subtitle?.trim(),
        status: (dto.status ?? 'ACTIVE').toUpperCase(),
        data: (dto.data ?? {}) as Prisma.InputJsonValue,
        eventAt: dto.eventAt ? new Date(dto.eventAt) : undefined,
      },
    });
  }

  async update(
    facilityId: string,
    module: string,
    id: string,
    dto: UpdateOperationalRecordDto,
  ) {
    this.assertModule(module);
    await this.requireRecord(facilityId, module, id);
    return this.prisma.operationalRecord.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.subtitle !== undefined ? { subtitle: dto.subtitle.trim() } : {}),
        ...(dto.status !== undefined ? { status: dto.status.toUpperCase() } : {}),
        ...(dto.data !== undefined ? { data: dto.data as Prisma.InputJsonValue } : {}),
        ...(dto.eventAt !== undefined ? { eventAt: new Date(dto.eventAt) } : {}),
      },
    });
  }

  async remove(facilityId: string, module: string, id: string) {
    this.assertModule(module);
    await this.requireRecord(facilityId, module, id);
    await this.prisma.operationalRecord.delete({ where: { id } });
    return { deleted: true };
  }

  private assertModule(module: string) {
    if (!MODULES.has(module)) throw new BadRequestException('Unsupported operational module');
  }

  private async requireRecord(facilityId: string, module: string, id: string) {
    const record = await this.prisma.operationalRecord.findFirst({
      where: { id, facilityId, module },
      select: { id: true },
    });
    if (!record) throw new NotFoundException('Record not found');
  }
}
