import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateResidentDto, ResidentQueryDto, UpdateResidentStatusDto } from './dto';
import { ResidentsService } from './residents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('residents')
@Controller('residents')
export class ResidentsController {
  constructor(private readonly residents: ResidentsService) {}
  @Get() @UseGuards(JwtAuthGuard) @ApiOperation({ summary: 'List and search residents' })
  list(@Query() query: ResidentQueryDto,@Req() request:any) { return this.residents.list(query,request.user.role==='Guest'?request.user.linkedResidentId:undefined); }
  @Get(':id') @UseGuards(JwtAuthGuard) @ApiOperation({ summary: 'Get a complete resident record' })
  get(@Param('id') id: string,@Req() request:any) { if(request.user.role==='Guest'&&request.user.linkedResidentId!==id)throw new ForbiddenException('Guest access is limited to the linked resident');return this.residents.get(id); }
  @Patch(':id/status') @ApiOperation({ summary: 'Change a resident status' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateResidentStatusDto) {
    return this.residents.updateStatus(id, dto.status);
  }
  @Post() @ApiCreatedResponse({ description: 'Resident admitted' })
  create(@Body() dto: CreateResidentDto) { return this.residents.create(dto); }
}
