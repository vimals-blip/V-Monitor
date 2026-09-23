import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../entities/user.entity';
import { AuditLogEntity } from '../entities/audit-log.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(AuditLogEntity) private auditRepo: Repository<AuditLogEntity>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(email: string, password: string, ip: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      throw new UnauthorizedException('Account is locked. Try again later.');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await this.userRepo.save(user);
      await this.auditLogin(user, 'FAILURE', ip);
      throw new UnauthorizedException('Invalid credentials');
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();
    
    const tokens = await this.generateTokens(user);
    user.refreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.userRepo.save(user);
    await this.auditLogin(user, 'SUCCESS', ip);

    const { passwordHash, refreshToken, ...userResult } = user;
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: userResult };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user || !user.refreshToken) throw new UnauthorizedException();
      
      const valid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!valid) throw new UnauthorizedException();

      const tokens = await this.generateTokens(user);
      user.refreshToken = await bcrypt.hash(tokens.refreshToken, 10);
      await this.userRepo.save(user);
      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, ip: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (user) {
      user.refreshToken = null;
      await this.userRepo.save(user);
      await this.auditLogin(user, 'SUCCESS', ip, 'logout');
    }
  }

  private async generateTokens(user: UserEntity) {
    const payload = { sub: user.id, email: user.email, role: user.role, organizationId: user.organizationId, tenantId: user.tenantId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { secret: this.configService.get('jwt.secret'), expiresIn: this.configService.get('jwt.expiresIn') }),
      this.jwtService.signAsync(payload, { secret: this.configService.get('jwt.refreshSecret'), expiresIn: this.configService.get('jwt.refreshExpiresIn') }),
    ]);
    return { accessToken, refreshToken };
  }

  private async auditLogin(user: UserEntity, result: string, ip: string, action = 'login') {
    try {
      await this.auditRepo.save(this.auditRepo.create({
        id: uuidv4(),
        organizationId: user.organizationId,
        tenantId: user.tenantId,
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action,
        resourceType: 'user',
        resourceId: user.id,
        result,
        sourceIp: ip,
        requestId: '',
      }));
    } catch (e: any) {
      this.logger.warn(`Failed to audit login: ${e?.message || e}`);
    }
  }
}
