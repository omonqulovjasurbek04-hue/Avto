import { TestsService } from './tests.service';
export declare class TestsController {
    private testsService;
    constructor(testsService: TestsService);
    start(userId: string, body: {
        categoryId: string;
    }): Promise<{
        sessionId: string;
        categoryId: string;
        question: {
            scene: unknown;
            actors: unknown;
        } | null;
        total: number;
    }>;
    answer(userId: string, sessionId: string, body: {
        questionId: string;
        answerId: string;
    }): Promise<{
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
    finish(userId: string, sessionId: string): Promise<{
        score: number;
        total: number;
        percentage: number;
    }>;
    history(userId: string): Promise<({
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
    getSession(userId: string, sessionId: string): Promise<{
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
