import { ApiProperty } from '@nestjs/swagger';
import { CarePriority } from '@prisma/client';
import { IsDateString, IsEnum, IsString, MinLength } from 'class-validator';

export class CreateCarePlanDto {
  @ApiProperty() @IsString() residentId!: string;
  @ApiProperty() @IsString() @MinLength(3) title!: string;
  @ApiProperty() @IsString() @MinLength(5) goals!: string;
  @ApiProperty() @IsString() @MinLength(5) guidance!: string;
  @ApiProperty({ enum: CarePriority }) @IsEnum(CarePriority) priority!: CarePriority;
  @ApiProperty() @IsDateString() reviewDate!: string;
}
