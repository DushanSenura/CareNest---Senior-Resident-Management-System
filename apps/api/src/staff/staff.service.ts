import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StaffStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateGuestAccountDto, CreateStaffDto, UpdateStaffDto } from './dto';
import { hashPassword } from '../auth/password';

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}
  async list() { const records = await this.prisma.staff.findMany({ orderBy: [{ status: 'asc' }, { lastName: 'asc' }], include: { _count: { select: { tasks: true, incidents: true } } } }); return records.map(this.safe); }
  async get(id: string) { const staff = await this.prisma.staff.findUnique({ where: { id } }); if (!staff) throw new NotFoundException('Staff member not found'); return this.safe(staff); }
  async create(dto: CreateStaffDto) { const employeeId=await this.generateEmployeeId(dto.role);const record = await this.prisma.staff.create({ data: await this.data(dto,employeeId) as Prisma.StaffUncheckedCreateInput }); return this.safe(record); }
  async update(id: string, dto: UpdateStaffDto) { const current=await this.prisma.staff.findUnique({where:{id}});if(!current)throw new NotFoundException('Staff member not found');const prefix=dto.role?this.rolePrefix(dto.role):undefined;const employeeId=prefix&&!current.employeeId?.startsWith(`${prefix}-`)?await this.generateEmployeeId(dto.role!):undefined;const record = await this.prisma.staff.update({ where: { id }, data: await this.data(dto,employeeId) as Prisma.StaffUncheckedUpdateInput }); return this.safe(record); }
  async updateStatus(id: string, status: StaffStatus) { await this.get(id); return this.prisma.staff.update({ where: { id }, data: { status } }); }
  async createGuest(dto:CreateGuestAccountDto){
    const resident=await this.prisma.resident.findUnique({where:{id:dto.residentId},include:{facility:true,admissionProfile:{select:{branch:true}}}});
    if(!resident)throw new NotFoundException('Resident not found');
    if(await this.prisma.staff.findFirst({where:{linkedResidentId:dto.residentId}}))throw new ConflictException('This resident already has a guest account');
    const employeeId=await this.generateEmployeeId('Guest');
    const record=await this.prisma.staff.create({data:{facilityId:resident.facilityId,linkedResidentId:resident.id,employeeId,firstName:dto.firstName,lastName:dto.lastName,email:dto.email.toLowerCase(),passwordHash:await hashPassword(dto.password),role:'Guest',branch:resident.admissionProfile?.branch||resident.facility.name,department:'Resident guest access',status:'ACTIVE',mustChangePassword:false}});
    return this.safe(record);
  }
  private rolePrefix(role:string){return ({'Super Admin':'SA','Admin':'AD','Guest':'GU','Care Manager':'CM','Caregiver':'CG','Nurse':'NU','Doctor':'DR','HR Manager':'HR'} as Record<string,string>)[role]??'ST'}
  private async generateEmployeeId(role:string){const prefix=this.rolePrefix(role);const records=await this.prisma.staff.findMany({where:{employeeId:{startsWith:`${prefix}-`}},select:{employeeId:true}});const highest=records.reduce((max,item)=>Math.max(max,Number(item.employeeId?.split('-').pop())||0),0);return `${prefix}-${String(highest+1).padStart(3,'0')}`}
  private async data(dto: UpdateStaffDto,generatedEmployeeId?:string) {
    const { password, employeeId: _ignored, ...fields } = dto as UpdateStaffDto & {employeeId?:string};
    return { ...fields, employeeId:generatedEmployeeId, passwordHash: password ? await hashPassword(password) : undefined, mustChangePassword: password ? false : undefined, hireDate: dto.hireDate ? new Date(dto.hireDate) : dto.hireDate === '' ? null : undefined };
  }
  private safe<T extends { passwordHash?: string | null }>(record: T) { const { passwordHash, ...safe } = record; return { ...safe, hasLoginAccount: Boolean(passwordHash) }; }
}
