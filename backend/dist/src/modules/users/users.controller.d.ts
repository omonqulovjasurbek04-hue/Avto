import { PrismaService } from '../../prisma/prisma.service';
export declare class UsersController {
    private prisma;
    constructor(prisma: PrismaService);
    me(userId: string): Promise<{
        user: {
            name: string;
            email: string | null;
            id: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
        } | null;
    }>;
}
