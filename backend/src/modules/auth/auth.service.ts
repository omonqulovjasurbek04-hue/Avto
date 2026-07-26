import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Bu email bilan ro\'yxatdan o\'tilgan');

    const password = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, password },
      select: { id: true, name: true, email: true, role: true },
    });

    const tokens = await this.generateTokens(user.id);
    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Email yoki parol noto\'g\'ri');

    const valid = await argon2.verify(user.password, dto.password);
    if (!valid) throw new UnauthorizedException('Email yoki parol noto\'g\'ri');

    const tokens = await this.generateTokens(user.id);
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      ...tokens,
    };
  }

  async refresh(oldRefreshToken: string, userId: string, tokenId: string) {
    const tokenHash = this.hashToken(oldRefreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.userId !== userId) {
      throw new UnauthorizedException('Refresh token not valid');
    }

    if (new Date() > stored.expiresAt) {
      throw new UnauthorizedException('Refresh token expired');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.generateTokens(userId);
    return tokens;
  }

  async logout(userId: string, tokenId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { id: tokenId, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async logoutAll(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  }

  private async generateTokens(userId: string) {
    const tokenId = uuidv4();
    const accessExpires = (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as string;
    const refreshExpires = (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as string;
    const accessToken = this.jwtService.sign(
      { sub: userId, type: 'access' },
      { expiresIn: accessExpires } as any,
    );
    const refreshTokenValue = this.jwtService.sign(
      { sub: userId, type: 'refresh', tokenId },
      { expiresIn: refreshExpires } as any,
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: this.hashToken(refreshTokenValue),
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken: refreshTokenValue };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
