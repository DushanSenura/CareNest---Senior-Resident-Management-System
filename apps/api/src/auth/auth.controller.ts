import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { ROLE_PERMISSIONS, STAFF_ROLES } from './roles';
class LoginDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() @MinLength(8) password!: string;
}
@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('login') login(@Body() dto: LoginDto, @Req() request: any) {
    const agent = String(request.headers['user-agent'] ?? '');
    return this.auth.login(dto.email, dto.password, { device: agent.includes('Mobile') ? 'Mobile device' : 'Desktop device', browser: agent, os: agent.includes('Windows') ? 'Windows' : agent.includes('Mac') ? 'macOS' : 'Unknown', ip: request.ip });
  }
  @Post('roles') roles() {
    return Object.entries(STAFF_ROLES).map(([key, name]) => ({
      key, name, permissions: ROLE_PERMISSIONS[key as keyof typeof ROLE_PERMISSIONS],
    }));
  }
}
