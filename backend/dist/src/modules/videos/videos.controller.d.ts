import { RawBodyRequest } from '@nestjs/common';
import { VideosService } from './videos.service';
export declare class VideosController {
    private videosService;
    constructor(videosService: VideosService);
    getUploadUrl(): Promise<{
        uploadUrl: any;
        videoId: string;
    }>;
    webhook(req: RawBodyRequest<Request>, signature: string): Promise<{
        error: string;
        ok?: undefined;
    } | {
        ok: boolean;
        error?: undefined;
    }>;
}
