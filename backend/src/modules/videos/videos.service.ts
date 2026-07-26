import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  constructor(private prisma: PrismaService) {}

  async createUploadUrl() {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    if (!accountId || !apiToken) {
      throw new BadRequestException('Cloudflare not configured');
    }

    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maxDurationSeconds: 300 }),
      },
    );
    const data: any = await res.json();
    if (!data.success) {
      this.logger.error('Cloudflare upload URL error', data.errors);
      throw new BadRequestException('Failed to get upload URL');
    }

    const video = await this.prisma.video.create({
      data: {
        streamUid: data.result.uid,
        playbackUrl: '',
        durationSec: 0,
        type: 'CORRECT',
        status: 'processing',
      },
    });

    return { uploadUrl: data.result.uploadURL, videoId: video.id };
  }

  verifyWebhook(rawBody: Buffer, signature: string): boolean {
    const secret = process.env.CLOUDFLARE_STREAM_WEBHOOK_SECRET;
    if (!secret) return true;
    if (!signature || !rawBody) return false;

    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    try {
      const parts = signature.split(',');
      const sigMap: Record<string, string> = {};
      for (const p of parts) {
        const [k, v] = p.split('=');
        sigMap[k] = v;
      }
      return sigMap['sig'] === expected;
    } catch {
      return false;
    }
  }

  async handleWebhook(body: any) {
    const uid = body?.uid;
    if (!uid) return;

    const status = body?.status?.state;
    if (status !== 'ready') return;

    const playbackUrl = body?.playback?.hls || `https://customer-${process.env.CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${uid}/manifest/video.m3u8`;
    const durationSec = body?.duration || 0;
    const thumbnailUrl = body?.thumbnail || `https://customer-${process.env.CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${uid}/thumbnails/thumbnail.jpg`;

    await this.prisma.video.update({
      where: { streamUid: uid },
      data: { playbackUrl, durationSec, thumbnailUrl, status: 'ready' },
    });

    this.logger.log(`Video ${uid} ready (${durationSec}s)`);
  }
}
