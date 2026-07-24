import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
export class CreateTaskDto {
  @ApiProperty() @IsString() residentId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() assigneeId?: string;
  @ApiProperty() @IsString() title!: string;
  @ApiProperty() @IsString() category!: string;
  @ApiProperty() @IsDateString() dueAt!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
export class UpdateTaskStatusDto { @ApiProperty({ enum: TaskStatus }) @IsEnum(TaskStatus) status!: TaskStatus; }
export class CreateShiftDto {
  @ApiProperty() @IsString() staffId!: string;
  @ApiProperty() @IsDateString() shiftDate!: string;
  @ApiProperty() @IsString() startTime!: string;
  @ApiProperty() @IsString() endTime!: string;
  @ApiProperty() @IsString() shiftType!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() unit?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
export class UpdateShiftStatusDto { @ApiProperty() @IsString() status!: string; }
