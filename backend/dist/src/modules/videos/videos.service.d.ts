import { PrismaService } from '../../prisma/prisma.service';
export declare class VideosService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createUploadUrl(): Promise<{
        uploadUrl: any;
        videoId: string;
    }>;
    verifyWebhook(rawBody: Buffer, signature: string): boolean;
    handleWebhook(body: any): Promise<void>;
}
