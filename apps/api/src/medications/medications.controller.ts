import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateMedicationDto, UpdateMedicationDto, UpdateMedicationStockDto } from './dto';
import { MedicationsService } from './medications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ROLES, requireRole } from '../auth/role-access';

@ApiTags('medications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('medications')
export class MedicationsController {
  constructor(private readonly medications: MedicationsService) {}
  @Get() @ApiOperation({ summary: 'List medication and stock records' })
  list(@Req() req:any) { requireRole(req.user.role,ROLES.allStaff);return this.medications.list(); }
  @Get(':id') @ApiOperation({ summary: 'Get medication details' })
  get(@Req() req:any,@Param('id') id: string) { requireRole(req.user.role,ROLES.allStaff);return this.medications.get(id); }
  @Post() @ApiOperation({ summary: 'Add resident medication' })
  create(@Req() req:any,@Body() dto: CreateMedicationDto) { requireRole(req.user.role,ROLES.clinical);return this.medications.create(dto); }
  @Patch(':id') @ApiOperation({ summary: 'Update medication details' })
  update(@Req() req:any,@Param('id') id: string, @Body() dto: UpdateMedicationDto) { requireRole(req.user.role,ROLES.clinical);return this.medications.update(id, dto); }
  @Patch(':id/stock') @ApiOperation({ summary: 'Update medication stock' })
  updateStock(@Req() req:any,@Param('id') id: string, @Body() dto: UpdateMedicationStockDto) { requireRole(req.user.role,ROLES.clinical);return this.medications.update(id, dto); }
}
