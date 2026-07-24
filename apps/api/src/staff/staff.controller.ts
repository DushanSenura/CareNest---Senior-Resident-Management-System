import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateGuestAccountDto, CreateStaffDto, UpdateStaffDto, UpdateStaffStatusDto } from './dto';
import { StaffService } from './staff.service';

@ApiTags('staff')
@Controller('staff')
export class StaffController {
  constructor(private readonly staff: StaffService) {}
  @Get() @ApiOperation({ summary: 'List staff' }) list() { return this.staff.list(); }
  @Get(':id') @ApiOperation({ summary: 'Get staff details' }) get(@Param('id') id: string) { return this.staff.get(id); }
  @Post() @ApiOperation({ summary: 'Add staff member' }) create(@Body() dto: CreateStaffDto) { return this.staff.create(dto); }
  @Post('guest-accounts') @ApiOperation({ summary: 'Create a resident-linked guest login' }) createGuest(@Body() dto:CreateGuestAccountDto){return this.staff.createGuest(dto)}
  @Patch(':id') @ApiOperation({ summary: 'Edit staff member' }) update(@Param('id') id: string, @Body() dto: UpdateStaffDto) { return this.staff.update(id, dto); }
  @Patch(':id/status') @ApiOperation({ summary: 'Change staff status' }) status(@Param('id') id: string, @Body() dto: UpdateStaffStatusDto) { return this.staff.updateStatus(id, dto.status); }
}
