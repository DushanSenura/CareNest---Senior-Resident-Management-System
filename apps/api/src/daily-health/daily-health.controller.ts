import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DailyHealthService } from './daily-health.service';
import { CreateDailyHealthReportDto } from './dto';
@ApiTags('daily health')
@Controller('daily-health')
export class DailyHealthController {
  constructor(private readonly health: DailyHealthService) {}
  @Get() @ApiOperation({ summary: 'List resident daily health reports' }) list(@Query('date') date?: string) { return this.health.list(date); }
  @Post() @ApiOperation({ summary: 'Record a resident daily health check' }) create(@Body() dto: CreateDailyHealthReportDto) { return this.health.create(dto); }
}
