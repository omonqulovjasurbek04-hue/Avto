import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';
interface JwtPayload {
    sub: string;
    type: 'access';
}
declare const JwtAccessStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtAccessStrategy extends JwtAccessStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(payload: JwtPayload): Promise<{
        name: string;
        email: string | null;
        id: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
}
export {};
