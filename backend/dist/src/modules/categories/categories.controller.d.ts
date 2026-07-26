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
        slug: string;
        order: number;
        createdAt: Date;
        updatedAt: Date;
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
        slug: string;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, body: Partial<{
        name: string;
        slug: string;
        order: number;
    }>): Promise<{
        id: string;
        name: string;
        slug: string;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        ok: boolean;
    }>;
}
