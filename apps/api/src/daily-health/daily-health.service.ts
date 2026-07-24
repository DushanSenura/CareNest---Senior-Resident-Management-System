import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDailyHealthReportDto } from './dto';
@Injectable()
export class DailyHealthService {
  constructor(private readonly prisma: PrismaService) {}
  list(date?: string) {
    const start = date ? new Date(`${date}T00:00:00`) : undefined;
    const end = start ? new Date(start.getTime() + 86400000) : undefined;
    return this.prisma.dailyHealthReport.findMany({
      where: start && end ? { reportDate: { gte: start, lt: end } } : {},
      orderBy: { reportDate: 'desc' },
      include: { resident: { select: { id: true, firstName: true, lastName: true, preferredName: true, room: true, priority: true } } },
    });
  }
  async create(dto: CreateDailyHealthReportDto) {
    const resident = await this.prisma.resident.findUnique({ where: { id: dto.residentId }, select: { id: true } });
    if (!resident) throw new NotFoundException('Resident not found');
    const reportDate = new Date(dto.reportDate); reportDate.setHours(0, 0, 0, 0);
    const exists = await this.prisma.dailyHealthReport.findUnique({ where: { residentId_reportDate: { residentId: dto.residentId, reportDate } } });
    if (exists) throw new ConflictException('A daily health report already exists for this resident and date');
    return this.prisma.dailyHealthReport.create({ data: { ...dto, reportDate }, include: { resident: true } });
  }
}
