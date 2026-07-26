import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CarePlansService } from './care-plans.service';
import { CreateCarePlanDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ROLES, requireRole } from '../auth/role-access';

@ApiTags('care plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('care-plans')
export class CarePlansController {
  constructor(private readonly carePlans: CarePlansService) {}

  @Get()
  @ApiOperation({ summary: 'List resident care plans' })
  list(@Req() req:any) { requireRole(req.user.role,ROLES.allStaff);return this.carePlans.list(); }

  @Post()
  @ApiCreatedResponse({ description: 'Care plan created' })
  create(@Req() req:any,@Body() dto: CreateCarePlanDto) { requireRole(req.user.role,ROLES.administrators);return this.carePlans.create(dto); }
}
