import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateMedicationDto, UpdateMedicationDto, UpdateMedicationStockDto } from './dto';
import { MedicationsService } from './medications.service';

@ApiTags('medications')
@Controller('medications')
export class MedicationsController {
  constructor(private readonly medications: MedicationsService) {}
  @Get() @ApiOperation({ summary: 'List medication and stock records' })
  list() { return this.medications.list(); }
  @Get(':id') @ApiOperation({ summary: 'Get medication details' })
  get(@Param('id') id: string) { return this.medications.get(id); }
  @Post() @ApiOperation({ summary: 'Add resident medication' })
  create(@Body() dto: CreateMedicationDto) { return this.medications.create(dto); }
  @Patch(':id') @ApiOperation({ summary: 'Update medication details' })
  update(@Param('id') id: string, @Body() dto: UpdateMedicationDto) { return this.medications.update(id, dto); }
  @Patch(':id/stock') @ApiOperation({ summary: 'Update medication stock' })
  updateStock(@Param('id') id: string, @Body() dto: UpdateMedicationStockDto) { return this.medications.update(id, dto); }
}
