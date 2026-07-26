import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateGuestAccountDto, CreateStaffDto, UpdateStaffDto, UpdateStaffStatusDto } from './dto';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ROLES, requireRole } from '../auth/role-access';

@ApiTags('staff')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('staff')
export class StaffController {
  constructor(private readonly staff: StaffService) {}
  @Get() @ApiOperation({ summary: 'List staff' }) list(@Req() req:any) {requireRole(req.user.role,ROLES.staffManagers);return this.staff.list(); }
  @Get(':id') @ApiOperation({ summary: 'Get staff details' }) get(@Req() req:any,@Param('id') id: string) {requireRole(req.user.role,ROLES.staffManagers);return this.staff.get(id); }
  @Post() @ApiOperation({ summary: 'Add staff member' }) create(@Req() req:any,@Body() dto: CreateStaffDto) {requireRole(req.user.role,ROLES.staffManagers);return this.staff.create(dto); }
  @Post('guest-accounts') @ApiOperation({ summary: 'Create a resident-linked guest login' }) createGuest(@Req() req:any,@Body() dto:CreateGuestAccountDto){requireRole(req.user.role,ROLES.staffManagers);return this.staff.createGuest(dto)}
  @Patch(':id') @ApiOperation({ summary: 'Edit staff member' }) update(@Req() req:any,@Param('id') id: string, @Body() dto: UpdateStaffDto) {requireRole(req.user.role,ROLES.staffManagers);return this.staff.update(id, dto); }
  @Patch(':id/status') @ApiOperation({ summary: 'Change staff status' }) status(@Req() req:any,@Param('id') id: string, @Body() dto: UpdateStaffStatusDto) {requireRole(req.user.role,ROLES.staffManagers);return this.staff.updateStatus(id, dto.status); }
}
