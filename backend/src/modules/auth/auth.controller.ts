import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request) {
    const user = req.user as any;
    return this.authService.refresh(user.refreshToken, user.userId);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser('id') userId: string, @Body() dto: LogoutDto) {
    await this.authService.logout(userId, dto.refreshToken);
    return { ok: true };
  }

  @Get('me')
  async me(@CurrentUser('id') userId: string) {
    const user = await this.authService.getProfile(userId);
    return { user };
  }
}
