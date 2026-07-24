import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { hashPassword, verifyPassword } from '../auth/password';
@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}
  async get(staffId:string){const staff=await this.prisma.staff.findUnique({where:{id:staffId},include:{preferences:true}});if(!staff)throw new NotFoundException();const{passwordHash,...safe}=staff;return safe}
  async profile(staffId:string,data:Record<string,unknown>){const allowed=['firstName','lastName','preferredName','department','branch','jobTitle','email','phone','workPhone','address','emergencyContact','dateOfBirth','gender','preferredLanguage','timezone','biography','username','displayName','preferredLoginEmail','profilePhotoUrl'];const update=Object.fromEntries(Object.entries(data).filter(([k])=>allowed.includes(k)));if(update.dateOfBirth)update.dateOfBirth=new Date(String(update.dateOfBirth));return this.prisma.staff.update({where:{id:staffId},data:update as Prisma.StaffUpdateInput,select:{id:true,firstName:true,lastName:true,email:true,role:true,employeeId:true,department:true,status:true}})}
  async preferences(staffId:string,settings:unknown){return this.prisma.userPreference.upsert({where:{staffId},update:{settings:settings as Prisma.InputJsonValue},create:{staffId,settings:settings as Prisma.InputJsonValue}})}
  async password(staffId:string,current:string,next:string){if(next.length<8)throw new BadRequestException('New password must contain at least 8 characters');const staff=await this.prisma.staff.findUnique({where:{id:staffId}});if(!staff?.passwordHash||!await verifyPassword(current,staff.passwordHash))throw new UnauthorizedException('Current password is incorrect');await this.prisma.staff.update({where:{id:staffId},data:{passwordHash:await hashPassword(next),lastPasswordChangeAt:new Date(),mustChangePassword:false}});return{success:true}}
  sessions(staffId:string){return this.prisma.loginSession.findMany({where:{staffId,revokedAt:null},orderBy:{lastActivity:'desc'}})}
  async revoke(staffId:string,sessionId:string){await this.prisma.loginSession.updateMany({where:{id:sessionId,staffId},data:{revokedAt:new Date()}});return{success:true}}
  async revokeAll(staffId:string,current?:string){await this.prisma.loginSession.updateMany({where:{staffId,revokedAt:null,...(current?{id:{not:current}}:{})},data:{revokedAt:new Date()}});return{success:true}}
}
