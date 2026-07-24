import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SettingsService } from './settings.service';
@ApiTags('settings') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Controller('settings')
export class SettingsController {
 constructor(private readonly settings:SettingsService){}
 @Get() get(@Req()r:any){return this.settings.get(r.user.sub)}
 @Patch('profile') profile(@Req()r:any,@Body()b:Record<string,unknown>){return this.settings.profile(r.user.sub,b)}
 @Patch('preferences') preferences(@Req()r:any,@Body()b:{settings:unknown}){return this.settings.preferences(r.user.sub,b.settings)}
 @Post('password') password(@Req()r:any,@Body()b:{currentPassword:string;newPassword:string}){return this.settings.password(r.user.sub,b.currentPassword,b.newPassword)}
 @Get('sessions') sessions(@Req()r:any){return this.settings.sessions(r.user.sub)}
 @Delete('sessions/:id') revoke(@Req()r:any,@Param('id')id:string){return this.settings.revoke(r.user.sub,id)}
 @Delete('sessions') revokeAll(@Req()r:any){return this.settings.revokeAll(r.user.sub,r.user.sessionId)}
 @Get('export') async export(@Req()r:any){return{exportedAt:new Date(),account:await this.settings.get(r.user.sub),sessions:await this.settings.sessions(r.user.sub)}}
}
