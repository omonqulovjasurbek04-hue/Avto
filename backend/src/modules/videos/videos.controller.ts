import { Controller, Post, Get, Headers, Body, RawBodyRequest, Req } from '@nestjs/common';
import { VideosService } from './videos.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '@prisma/client';
import * as crypto from 'crypto';

@Controller()
export class VideosController {
  constructor(private videosService: VideosService) {}

  @Roles(Role.ADMIN)
  @Post('admin/videos/upload-url')
  async getUploadUrl() {
    return this.videosService.createUploadUrl();
  }

  @Public()
  @Post('videos/webhook')
  async webhook(@Req() req: RawBodyRequest<Request>, @Headers('webhook-signature') signature: string) {
    const rawBody = (req as any).rawBody;
    if (!this.videosService.verifyWebhook(rawBody, signature)) {
      return { error: 'Invalid signature' };
    }
    const body = (req as any).body;
    await this.videosService.handleWebhook(body);
    return { ok: true };
  }
}
