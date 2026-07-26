import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            name: string;
            email: string | null;
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    refresh(oldRefreshToken: string, userId: string, tokenId: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string, tokenId: string): Promise<void>;
    logoutAll(userId: string): Promise<void>;
    getProfile(userId: string): Promise<{
        name: string;
        email: string | null;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
    } | null>;
    private generateTokens;
    private hashToken;
}
