import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    refresh(req: Request): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string, tokenId?: string): Promise<{
        ok: boolean;
    }>;
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
