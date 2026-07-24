import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CarePriority, ResidentStatus } from '@prisma/client';
import { IsArray, IsDateString, IsEnum, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateResidentDto {
  @ApiProperty() @IsString() facilityId!: string;
  @ApiProperty() @IsString() @MinLength(2) firstName!: string;
  @ApiProperty() @IsString() @MinLength(2) lastName!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() preferredName?: string;
  @ApiProperty() @IsDateString() dateOfBirth!: string;
  @ApiProperty() @IsString() room!: string;
  @ApiProperty({ enum: CarePriority }) @IsEnum(CarePriority) priority!: CarePriority;
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) allergies!: string[];
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) dietaryNeeds!: string[];
  @ApiProperty() @IsString() emergencyName!: string;
  @ApiProperty() @IsString() emergencyPhone!: string;
  @ApiProperty() @IsDateString() admissionDate!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() admissionTime?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() admissionType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() admissionStatus?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() branch?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() building?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() floor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() expectedLengthOfStay?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() referralSource?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() admissionOfficer?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() careManager?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() primaryCaregiver?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() admissionData?: Record<string, unknown>;
}

export class ResidentQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ enum: ResidentStatus }) @IsOptional() @IsEnum(ResidentStatus) status?: ResidentStatus;
}

export class UpdateResidentStatusDto {
  @ApiProperty({ enum: ResidentStatus })
  @IsEnum(ResidentStatus)
  status!: ResidentStatus;
}
