import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DailyHealthService } from './daily-health.service';
import { CreateDailyHealthReportDto, UpdateDailyHealthReportDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
@ApiTags('daily health')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('daily-health')
export class DailyHealthController {
  constructor(private readonly health: DailyHealthService) {}
  @Get() @ApiOperation({ summary: 'List role-visible resident daily health reports' }) list(@Req() req:any,@Query('date') date?: string) { return this.health.list(req.user,date); }
  @Post() @ApiOperation({ summary: 'Create a submitted report or 24-hour draft' }) create(@Req() req:any,@Body() dto: CreateDailyHealthReportDto) { return this.health.create(req.user,dto); }
  @Patch(':id') @ApiOperation({ summary: 'Edit an owned draft within its 24-hour window' }) update(@Req() req:any,@Param('id') id:string,@Body() dto:UpdateDailyHealthReportDto){return this.health.update(req.user,id,dto)}
}
