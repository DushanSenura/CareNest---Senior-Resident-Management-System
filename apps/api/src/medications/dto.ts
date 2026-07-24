import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateMedicationDto {
  @ApiProperty() @IsString() residentId!: string;
  @ApiProperty() @IsString() @MinLength(2) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() genericName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() strength?: string;
  @ApiProperty() @IsString() dosage!: string;
  @ApiProperty() @IsString() route!: string;
  @ApiProperty() @IsString() frequency!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() instructions?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() prescribingDoctor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) stockQuantity?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() stockUnit?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) reorderLevel?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() supplier?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() batchNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() expiryDate?: string;
  @ApiProperty() @IsDateString() startsAt!: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endsAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() active?: boolean;
}

export class UpdateMedicationDto extends PartialType(CreateMedicationDto) {}

export class UpdateMedicationStockDto {
  @ApiProperty() @IsInt() @Min(0) stockQuantity!: number;
}
