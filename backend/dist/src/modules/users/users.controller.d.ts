import { PrismaService } from '../../prisma/prisma.service';
export declare class UsersController {
    private prisma;
    constructor(prisma: PrismaService);
    me(userId: string): Promise<{
        user: {
            id: string;
            email: string | null;
            phone: string | null;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
        } | null;
    }>;
}
