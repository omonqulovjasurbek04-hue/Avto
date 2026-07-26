import { PrismaService } from '../../prisma/prisma.service';
export declare class TestsService {
    private prisma;
    constructor(prisma: PrismaService);
    startSession(userId: string, categoryId: string): Promise<{
        sessionId: string;
        categoryId: string;
        question: {
            id: string;
            text: string;
            imageUrl: string | null;
            answers: {
                id: string;
                text: string;
            }[];
        };
        total: number;
    }>;
    answerQuestion(userId: string, sessionId: string, questionId: string, answerId: string): Promise<{
        isCorrect: boolean;
        video: {
            playbackUrl: string;
            durationSec: number;
            type: import(".prisma/client").$Enums.VideoType;
        } | null;
        nextQuestion: {
            id: string;
            text: string;
            imageUrl: string | null;
            answers: {
                id: string;
                text: string;
            }[];
        } | null;
    }>;
    finishSession(userId: string, sessionId: string): Promise<{
        score: number;
        total: number;
        percentage: number;
    }>;
    getHistory(userId: string): Promise<({
        category: {
            name: string;
            id: string;
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
            name: string;
            id: string;
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
