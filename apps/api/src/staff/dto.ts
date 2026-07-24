import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { StaffStatus } from '@prisma/client';
import { IsDateString, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { STAFF_ROLES } from '../auth/roles';

export class CreateStaffDto {
  @ApiProperty() @IsString() facilityId!: string;
  @ApiProperty() @IsString() @MinLength(2) firstName!: string;
  @ApiProperty() @IsString() @MinLength(2) lastName!: string;
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8) password!: string;
  @ApiProperty({ enum: Object.values(STAFF_ROLES) }) @IsEnum(STAFF_ROLES) role!: string;
  @ApiProperty() @IsString() @MinLength(2) branch!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() department?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() shift?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() hireDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() emergencyContact?: string;
  @ApiPropertyOptional({ enum: StaffStatus }) @IsOptional() @IsEnum(StaffStatus) status?: StaffStatus;
}
export class UpdateStaffDto extends PartialType(CreateStaffDto) {}
export class UpdateStaffStatusDto {
  @ApiProperty({ enum: StaffStatus }) @IsEnum(StaffStatus) status!: StaffStatus;
}
export class CreateGuestAccountDto {
  @ApiProperty() @IsString() residentId!: string;
  @ApiProperty() @IsString() @MinLength(2) firstName!: string;
  @ApiProperty() @IsString() @MinLength(2) lastName!: string;
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8) password!: string;
}
