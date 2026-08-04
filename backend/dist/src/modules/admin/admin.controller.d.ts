import { PrismaService } from '../../prisma/prisma.service';
export declare class AdminController {
    private prisma;
    constructor(prisma: PrismaService);
    stats(): Promise<{
        users: number;
        questions: number;
        answers: number;
        categories: number;
        videos: number;
        testSessions: number;
        avgScore: number;
    }>;
    listVideos(): Promise<({
        _count: {
            answers: number;
        };
    } & {
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.VideoType;
        title: string | null;
        streamUid: string;
        playbackUrl: string;
        thumbnailUrl: string | null;
        durationSec: number;
        status: string;
    })[]>;
}
