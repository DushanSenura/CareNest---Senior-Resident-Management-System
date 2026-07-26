import { ConflictException, ForbiddenException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ROLES, requireRole } from '../auth/role-access';
import { CreateDailyHealthReportDto, UpdateDailyHealthReportDto } from './dto';

type User = { sub:string; role:string; facilityId:string };

@Injectable()
export class DailyHealthService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    void this.submitExpiredDrafts();
    const timer = setInterval(() => void this.submitExpiredDrafts(), 60_000);
    timer.unref();
  }

  async list(user:User,date?:string) {
    requireRole(user.role,ROLES.allStaff);
    await this.submitExpiredDrafts();
    const start=date?new Date(`${date}T00:00:00`):undefined,end=start?new Date(start.getTime()+86400000):undefined;
    const draftVisibility = ['Nurse','Doctor','HR Manager','Admin','Super Admin'].includes(user.role)
      ? {}
      : { OR:[{status:'SUBMITTED'},{createdById:user.sub}] };
    return this.prisma.dailyHealthReport.findMany({
      where:{
        resident:{facilityId:user.facilityId},
        ...(start&&end?{reportDate:{gte:start,lt:end}}:{}),
        ...draftVisibility,
      },
      orderBy:{reportDate:'desc'},
      include:{resident:{select:{id:true,firstName:true,lastName:true,preferredName:true,room:true,priority:true}}},
    });
  }

  async create(user:User,dto:CreateDailyHealthReportDto) {
    requireRole(user.role,ROLES.careReportAuthors);
    const resident=await this.prisma.resident.findFirst({where:{id:dto.residentId,facilityId:user.facilityId},select:{id:true}});
    if(!resident)throw new NotFoundException('Resident not found');
    const reportDate=new Date(dto.reportDate);reportDate.setHours(0,0,0,0);
    const exists=await this.prisma.dailyHealthReport.findUnique({where:{residentId_reportDate:{residentId:dto.residentId,reportDate}}});
    if(exists)throw new ConflictException('A daily health report already exists for this resident and date');
    const staff=await this.prisma.staff.findUnique({where:{id:user.sub},select:{firstName:true,lastName:true}});
    const status=dto.status??'SUBMITTED',now=new Date();
    const data=this.reportData(dto);
    return this.prisma.dailyHealthReport.create({
      data:{...data,residentId:dto.residentId,reportDate,recordedBy:staff?`${staff.firstName} ${staff.lastName}`:dto.recordedBy,createdById:user.sub,status,editableUntil:status==='DRAFT'?new Date(now.getTime()+86400000):now,submittedAt:status==='SUBMITTED'?now:null},
      include:{resident:true},
    });
  }

  async update(user:User,id:string,dto:UpdateDailyHealthReportDto){
    await this.submitExpiredDrafts();
    const report=await this.prisma.dailyHealthReport.findFirst({where:{id,resident:{facilityId:user.facilityId}}});
    if(!report)throw new NotFoundException('Daily health report not found');
    if(report.status!=='DRAFT')throw new ForbiddenException('Submitted reports cannot be edited');
    if(report.createdById!==user.sub)throw new ForbiddenException('You can only edit drafts you created');
    if(!report.editableUntil||report.editableUntil<=new Date())throw new ForbiddenException('The 24-hour editing period has ended');
    const status=dto.status??'DRAFT',now=new Date();
    return this.prisma.dailyHealthReport.update({
      where:{id},
      data:{...this.reportData(dto),status,submittedAt:status==='SUBMITTED'?now:null,editableUntil:status==='SUBMITTED'?now:report.editableUntil},
      include:{resident:true},
    });
  }

  private submitExpiredDrafts(){
    const now=new Date();
    return this.prisma.dailyHealthReport.updateMany({where:{status:'DRAFT',editableUntil:{lte:now}},data:{status:'SUBMITTED',submittedAt:now}});
  }

  private reportData(dto:CreateDailyHealthReportDto){
    const {residentId:_,reportDate:__,recordedBy:___,status:____,...data}=dto;
    return data;
  }
}
