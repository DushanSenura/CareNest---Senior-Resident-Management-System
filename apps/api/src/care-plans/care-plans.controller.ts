import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CarePlansService } from './care-plans.service';
import { CreateCarePlanDto } from './dto';

@ApiTags('care plans')
@Controller('care-plans')
export class CarePlansController {
  constructor(private readonly carePlans: CarePlansService) {}

  @Get()
  @ApiOperation({ summary: 'List resident care plans' })
  list() { return this.carePlans.list(); }

  @Post()
  @ApiCreatedResponse({ description: 'Care plan created' })
  create(@Body() dto: CreateCarePlanDto) { return this.carePlans.create(dto); }
}
