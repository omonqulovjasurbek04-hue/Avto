import { PrismaService } from '../../prisma/prisma.service';
export declare class QuestionsController {
    private prisma;
    constructor(prisma: PrismaService);
    findByCategory(categoryId: string): Promise<{
        id: string;
        text: string;
        imageUrl: string | null;
        order: number;
        answers: {
            id: string;
            text: string;
        }[];
    }[]>;
    findOneAdmin(id: string): Promise<{
        answers: ({
            video: {
                id: string;
                createdAt: Date;
                type: import(".prisma/client").$Enums.VideoType;
                title: string | null;
                streamUid: string;
                playbackUrl: string;
                thumbnailUrl: string | null;
                durationSec: number;
                status: string;
            } | null;
        } & {
            id: string;
            text: string;
            questionId: string;
            isCorrect: boolean;
            videoId: string | null;
        })[];
    } & {
        id: string;
        categoryId: string;
        text: string;
        imageUrl: string | null;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(body: {
        categoryId: string;
        text: string;
        imageUrl?: string;
        order?: number;
    }): Promise<{
        id: string;
        categoryId: string;
        text: string;
        imageUrl: string | null;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, body: Partial<{
        text: string;
        imageUrl: string;
        order: number;
    }>): Promise<{
        id: string;
        categoryId: string;
        text: string;
        imageUrl: string | null;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        ok: boolean;
    }>;
    addAnswer(questionId: string, body: {
        text: string;
        isCorrect: boolean;
        videoId?: string;
    }): Promise<{
        id: string;
        text: string;
        questionId: string;
        isCorrect: boolean;
        videoId: string | null;
    }>;
    updateAnswer(id: string, body: Partial<{
        text: string;
        isCorrect: boolean;
        videoId: string;
    }>): Promise<{
        id: string;
        text: string;
        questionId: string;
        isCorrect: boolean;
        videoId: string | null;
    }>;
}
