import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsDateString, IsObject, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateOperationalRecordDto {
  @ApiProperty({ example: 'Physiotherapy appointment' })
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title!: string;

  @ApiPropertyOptional({ example: 'Room A-104 at 10:30 AM' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  subtitle?: string;

  @ApiPropertyOptional({ example: 'SCHEDULED' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  status?: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;

  @ApiPropertyOptional({ example: '2026-07-27T10:30:00.000Z' })
  @IsOptional()
  @IsDateString()
  eventAt?: string;
}

export class UpdateOperationalRecordDto extends PartialType(CreateOperationalRecordDto) {}
