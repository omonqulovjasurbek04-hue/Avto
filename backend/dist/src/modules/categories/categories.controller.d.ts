import { PrismaService } from '../../prisma/prisma.service';
export declare class CategoriesController {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        name: string;
        slug: string;
        order: number;
        _count: {
            questions: number;
        };
    }[]>;
    findOne(id: string): Promise<({
        _count: {
            questions: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        order: number;
    }) | {
        error: string;
    }>;
    create(body: {
        name: string;
        slug: string;
        order?: number;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        order: number;
    }>;
    update(id: string, body: Partial<{
        name: string;
        slug: string;
        order: number;
    }>): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        order: number;
    }>;
    remove(id: string): Promise<{
        ok: boolean;
    }>;
}
