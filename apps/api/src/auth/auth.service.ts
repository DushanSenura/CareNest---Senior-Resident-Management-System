import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { verifyPassword } from './password';
import { ROLE_PERMISSIONS, roleKey } from './roles';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}
  async login(email: string, password: string, meta?: { device?: string; browser?: string; os?: string; ip?: string }) {
    const staff = await this.prisma.staff.findUnique({ where: { email: email.toLowerCase() } });
    if (!staff?.passwordHash || staff.status !== 'ACTIVE' || !await verifyPassword(password, staff.passwordHash)) throw new UnauthorizedException('Invalid email or password');
    const { passwordHash: _, ...account } = staff;
    const key = roleKey(staff.role);
    const permissions = key ? ROLE_PERMISSIONS[key] : [];
    const session = await this.prisma.loginSession.create({ data: { staffId: staff.id, deviceName: meta?.device ?? 'Web browser', browser: meta?.browser, operatingSystem: meta?.os, ipAddress: meta?.ip } });
    await this.prisma.staff.update({ where: { id: staff.id }, data: { lastLoginAt: new Date() } });
    return {
      accessToken: await this.jwt.signAsync({ sub: staff.id, sessionId: session.id, email: staff.email, role: staff.role, permissions, facilityId: staff.facilityId, linkedResidentId: staff.linkedResidentId }),
      mustChangePassword: staff.mustChangePassword,
      permissions,
      staff: account,
    };
  }
}
