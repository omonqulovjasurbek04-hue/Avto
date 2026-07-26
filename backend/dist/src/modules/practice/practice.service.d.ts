import { PrismaService } from '../../prisma/prisma.service';
export declare class PracticeService {
    private prisma;
    constructor(prisma: PrismaService);
    checkAnswer(questionId: string, answerId: string): Promise<{
        isCorrect: boolean;
        correctAnswerId: string | null;
        video: {
            playbackUrl: string;
            durationSec: number;
            type: import(".prisma/client").$Enums.VideoType;
        } | null;
    }>;
}
