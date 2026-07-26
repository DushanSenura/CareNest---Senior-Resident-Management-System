import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOperationalRecordDto, UpdateOperationalRecordDto } from './dto';
import { OperationsService } from './operations.service';
import { ROLES, requireRole } from '../auth/role-access';

type AuthRequest = { user: { sub: string; facilityId: string; role:string } };

@ApiTags('mobile operations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('operations')
export class OperationsController {
  constructor(private readonly operations: OperationsService) {}

  @Get(':module')
  @ApiOperation({ summary: 'List facility operational records' })
  list(
    @Req() request: AuthRequest,
    @Param('module') module: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    this.authorize(request.user.role,module,'read');
    return this.operations.list(request.user.facilityId, module, status, search);
  }

  @Post(':module')
  @ApiOperation({ summary: 'Create a facility operational record' })
  create(
    @Req() request: AuthRequest,
    @Param('module') module: string,
    @Body() dto: CreateOperationalRecordDto,
  ) {
    this.authorize(request.user.role,module,'write');
    return this.operations.create(request.user.facilityId, request.user.sub, module, dto);
  }

  @Patch(':module/:id')
  @ApiOperation({ summary: 'Update a facility operational record' })
  update(
    @Req() request: AuthRequest,
    @Param('module') module: string,
    @Param('id') id: string,
    @Body() dto: UpdateOperationalRecordDto,
  ) {
    this.authorize(request.user.role,module,'write');
    return this.operations.update(request.user.facilityId, module, id, dto);
  }

  @Delete(':module/:id')
  @ApiOperation({ summary: 'Delete a facility operational record' })
  remove(
    @Req() request: AuthRequest,
    @Param('module') module: string,
    @Param('id') id: string,
  ) {
    this.authorize(request.user.role,module,'write');
    return this.operations.remove(request.user.facilityId, module, id);
  }

  private authorize(role:string,module:string,action:'read'|'write'){
    if(module==='audit-logs'&&action==='write')throw new ForbiddenException('Audit logs are immutable and cannot be created, edited, or removed');
    if(module==='schedule'||module==='announcements'||module==='messages'){
      requireRole(role,ROLES.allStaff);
      if(action==='write'&&module!=='messages')requireRole(role,ROLES.administrators);
      return;
    }
    requireRole(role,ROLES.administrators);
  }
}
