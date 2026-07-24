import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma.service';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}
  @Get('summary')
  async summary() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [residents, tasksDue, tasksCompleted, incidents] = await Promise.all([
      this.prisma.resident.count({ where: { status: 'ACTIVE' } }),
      this.prisma.careTask.count({ where: { dueAt: { gte: today }, status: { in: ['PENDING', 'IN_PROGRESS'] } } }),
      this.prisma.careTask.count({ where: { completedAt: { gte: today } } }),
      this.prisma.incident.count({ where: { occurredAt: { gte: today } } }),
    ]);
    return { residents, tasksDue, tasksCompleted, incidents };
  }
}
