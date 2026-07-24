import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateShiftDto, CreateTaskDto } from './dto';
@Injectable()
export class TasksShiftsService {
  constructor(private readonly prisma: PrismaService) {}
  tasks() { return this.prisma.careTask.findMany({ orderBy: { dueAt: 'asc' }, include: { resident: { select: { id: true, firstName: true, lastName: true, preferredName: true, room: true } }, assignee: { select: { id: true, firstName: true, lastName: true, role: true } } } }); }
  createTask(dto: CreateTaskDto) { return this.prisma.careTask.create({ data: { ...dto, assigneeId: dto.assigneeId || undefined, dueAt: new Date(dto.dueAt) }, include: { resident: true, assignee: true } }); }
  async taskStatus(id: string, status: TaskStatus) { const task=await this.prisma.careTask.findUnique({where:{id}});if(!task)throw new NotFoundException('Task not found');return this.prisma.careTask.update({where:{id},data:{status,completedAt:status==='COMPLETED'?new Date():null}}); }
  shifts(date?: string) { const start=date?new Date(`${date}T00:00:00`):undefined;const end=start?new Date(start.getTime()+86400000):undefined;return this.prisma.staffShift.findMany({where:start&&end?{shiftDate:{gte:start,lt:end}}:{},orderBy:[{shiftDate:'asc'},{startTime:'asc'}],include:{staff:{select:{id:true,firstName:true,lastName:true,role:true,department:true,status:true}}}}); }
  createShift(dto: CreateShiftDto) { const shiftDate=new Date(dto.shiftDate);shiftDate.setHours(0,0,0,0);return this.prisma.staffShift.create({data:{...dto,shiftDate},include:{staff:true}}); }
  async shiftStatus(id:string,status:string){const shift=await this.prisma.staffShift.findUnique({where:{id}});if(!shift)throw new NotFoundException('Shift not found');return this.prisma.staffShift.update({where:{id},data:{status}});}
}
