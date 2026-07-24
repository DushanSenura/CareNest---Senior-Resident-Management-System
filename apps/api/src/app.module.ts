import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HealthController } from './health.controller';
import { PrismaService } from './prisma.service';
import { ResidentsController } from './residents/residents.controller';
import { ResidentsService } from './residents/residents.service';
import { DashboardController } from './dashboard/dashboard.controller';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { CarePlansController } from './care-plans/care-plans.controller';
import { CarePlansService } from './care-plans/care-plans.service';
import { MedicationsController } from './medications/medications.controller';
import { MedicationsService } from './medications/medications.service';
import { StaffController } from './staff/staff.controller';
import { StaffService } from './staff/staff.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { DailyHealthController } from './daily-health/daily-health.controller';
import { DailyHealthService } from './daily-health/daily-health.service';
import { TasksShiftsController } from './tasks-shifts/tasks-shifts.controller';
import { TasksShiftsService } from './tasks-shifts/tasks-shifts.service';
import { SettingsController } from './settings/settings.controller';
import { SettingsService } from './settings/settings.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    InfrastructureModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET', 'development-only-change-me'),
        signOptions: { expiresIn: '8h' },
      }),
    }),
  ],
  controllers: [HealthController, ResidentsController, DashboardController, CarePlansController, MedicationsController, StaffController, AuthController, DailyHealthController, TasksShiftsController, SettingsController],
  providers: [PrismaService, ResidentsService, CarePlansService, MedicationsService, StaffService, AuthService, DailyHealthService, TasksShiftsService, SettingsService, JwtAuthGuard],
})
export class AppModule {}
