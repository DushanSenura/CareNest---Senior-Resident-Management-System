import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
export class CreateDailyHealthReportDto {
  @ApiProperty() @IsString() residentId!: string;
  @ApiProperty() @IsDateString() reportDate!: string;
  @ApiProperty() @IsString() recordedBy!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bloodPressure?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() pulse?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() temperature?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(100) oxygenSaturation?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() respiratoryRate?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() bloodGlucose?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() weight?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(10) painLevel?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() mood?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() appetite?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() hydration?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sleepQuality?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() mobility?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bowelStatus?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() urinaryStatus?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() skinCondition?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() medicationTaken?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() healthChange?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() concerns?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() actionsTaken?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() escalation?: string;
  @ApiPropertyOptional({ enum: ['DRAFT', 'SUBMITTED'] }) @IsOptional() @IsIn(['DRAFT', 'SUBMITTED']) status?: 'DRAFT' | 'SUBMITTED';
}
export class UpdateDailyHealthReportDto extends CreateDailyHealthReportDto {}
