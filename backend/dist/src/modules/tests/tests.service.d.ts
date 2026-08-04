import { PrismaService } from '../../prisma/prisma.service';
export declare class TestsService {
    private prisma;
    constructor(prisma: PrismaService);
    startSession(userId: string, categoryId: string): Promise<{
        sessionId: string;
        categoryId: string;
        question: {
            scene: unknown;
            actors: unknown;
        } | null;
        total: number;
    }>;
    answerQuestion(userId: string, sessionId: string, questionId: string, answerId: string): Promise<{
        isCorrect: boolean;
        video: {
            playbackUrl: string;
            durationSec: number;
            type: import(".prisma/client").$Enums.VideoType;
        } | null;
        scene: import("../../common/utils/scene.util").SceneOutcome | null;
        nextQuestion: {
            scene: unknown;
            actors: unknown;
        } | null;
    }>;
    finishSession(userId: string, sessionId: string): Promise<{
        score: number;
        total: number;
        percentage: number;
    }>;
    getHistory(userId: string): Promise<({
        category: {
            id: string;
            name: string;
        };
        _count: {
            answers: number;
        };
    } & {
        id: string;
        userId: string;
        categoryId: string;
        startedAt: Date;
        finishedAt: Date | null;
        totalScore: number | null;
        totalCount: number | null;
    })[]>;
    getSessionDetail(userId: string, sessionId: string): Promise<{
        category: {
            id: string;
            name: string;
        };
        answers: ({
            question: {
                id: string;
                text: string;
            };
            answer: {
                id: string;
                text: string;
                isCorrect: boolean;
            };
        } & {
            id: string;
            questionId: string;
            isCorrect: boolean;
            sessionId: string;
            answerId: string;
            answeredAt: Date;
        })[];
    } & {
        id: string;
        userId: string;
        categoryId: string;
        startedAt: Date;
        finishedAt: Date | null;
        totalScore: number | null;
        totalCount: number | null;
    }>;
}
