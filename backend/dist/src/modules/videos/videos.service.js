"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var VideosService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const crypto = __importStar(require("crypto"));
let VideosService = VideosService_1 = class VideosService {
    prisma;
    logger = new common_1.Logger(VideosService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createUploadUrl() {
        const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        const apiToken = process.env.CLOUDFLARE_API_TOKEN;
        if (!accountId || !apiToken) {
            throw new common_1.BadRequestException('Cloudflare not configured');
        }
        const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ maxDurationSeconds: 300 }),
        });
        const data = await res.json();
        if (!data.success) {
            this.logger.error('Cloudflare upload URL error', data.errors);
            throw new common_1.BadRequestException('Failed to get upload URL');
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
    verifyWebhook(rawBody, signature) {
        const secret = process.env.CLOUDFLARE_STREAM_WEBHOOK_SECRET;
        if (!secret)
            return true;
        if (!signature || !rawBody)
            return false;
        const expected = crypto
            .createHmac('sha256', secret)
            .update(rawBody)
            .digest('hex');
        try {
            const parts = signature.split(',');
            const sigMap = {};
            for (const p of parts) {
                const [k, v] = p.split('=');
                sigMap[k] = v;
            }
            const provided = sigMap['sig'];
            if (!provided || provided.length !== expected.length)
                return false;
            return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
        }
        catch {
            return false;
        }
    }
    async handleWebhook(body) {
        const uid = body?.uid;
        if (!uid)
            return;
        const status = body?.status?.state;
        if (status !== 'ready')
            return;
        const playbackUrl = body?.playback?.hls || `https://customer-${process.env.CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${uid}/manifest/video.m3u8`;
        const durationSec = body?.duration || 0;
        const thumbnailUrl = body?.thumbnail || `https://customer-${process.env.CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${uid}/thumbnails/thumbnail.jpg`;
        await this.prisma.video.update({
            where: { streamUid: uid },
            data: { playbackUrl, durationSec, thumbnailUrl, status: 'ready' },
        });
        this.logger.log(`Video ${uid} ready (${durationSec}s)`);
    }
};
exports.VideosService = VideosService;
exports.VideosService = VideosService = VideosService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VideosService);
//# sourceMappingURL=videos.service.js.map