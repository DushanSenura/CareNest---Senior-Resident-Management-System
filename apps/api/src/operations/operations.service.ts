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

  async list(facilityId: string, module: string, status?: string, search?: string) {
    this.assertModule(module);
    const records = await this.prisma.operationalRecord.findMany({
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
    if (module !== 'audit-logs') return records;
    const sessions = await this.prisma.loginSession.findMany({
      where: {
        staff: { facilityId },
        ...(search ? {
          OR: [
            { staff: { firstName: { contains: search, mode: 'insensitive' } } },
            { staff: { lastName: { contains: search, mode: 'insensitive' } } },
            { staff: { email: { contains: search, mode: 'insensitive' } } },
            { ipAddress: { contains: search, mode: 'insensitive' } },
          ],
        } : {}),
      },
      orderBy: { loginAt: 'desc' },
      take: 100,
      include: { staff: { select: { firstName: true, lastName: true, email: true, role: true } } },
    });
    const loginEvents = sessions.map((session) => ({
      id: `login-${session.id}`,
      facilityId,
      module: 'audit-logs',
      title: `LOGIN · ${session.staff.firstName} ${session.staff.lastName}`,
      subtitle: `${session.staff.role} · ${session.staff.email} · ${session.deviceName}${session.ipAddress ? ` · ${session.ipAddress}` : ''}`,
      status: session.revokedAt ? 'REVOKED' : 'SUCCESS',
      data: {
        action: 'LOGIN',
        browser: session.browser,
        operatingSystem: session.operatingSystem,
        lastActivity: session.lastActivity,
      },
      eventAt: session.loginAt,
      createdById: session.staffId,
      createdAt: session.loginAt,
      updatedAt: session.lastActivity,
    }));
    return [...records, ...loginEvents].sort(
      (a, b) => (b.eventAt?.getTime() ?? b.createdAt.getTime()) - (a.eventAt?.getTime() ?? a.createdAt.getTime()),
    );
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
