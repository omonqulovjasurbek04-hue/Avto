"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const argon2 = __importStar(require("argon2"));
const uuid_1 = require("uuid");
const prisma_service_1 = require("../../prisma/prisma.service");
const crypto = __importStar(require("crypto"));
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing)
            throw new common_1.ConflictException('Bu email bilan ro\'yxatdan o\'tilgan');
        const password = await argon2.hash(dto.password);
        const user = await this.prisma.user.create({
            data: { name: dto.name, email: dto.email, password },
            select: { id: true, name: true, email: true, role: true },
        });
        const tokens = await this.generateTokens(user.id);
        return { user, ...tokens };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user)
            throw new common_1.UnauthorizedException('Email yoki parol noto\'g\'ri');
        const valid = await argon2.verify(user.password, dto.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Email yoki parol noto\'g\'ri');
        const tokens = await this.generateTokens(user.id);
        return {
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            ...tokens,
        };
    }
    async refresh(oldRefreshToken, userId, tokenId) {
        const tokenHash = this.hashToken(oldRefreshToken);
        const stored = await this.prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });
        if (!stored || stored.revokedAt || stored.userId !== userId) {
            throw new common_1.UnauthorizedException('Refresh token not valid');
        }
        if (new Date() > stored.expiresAt) {
            throw new common_1.UnauthorizedException('Refresh token expired');
        }
        await this.prisma.refreshToken.update({
            where: { id: stored.id },
            data: { revokedAt: new Date() },
        });
        const tokens = await this.generateTokens(userId);
        return tokens;
    }
    async logout(userId, tokenId) {
        await this.prisma.refreshToken.updateMany({
            where: { id: tokenId, userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
    async logoutAll(userId) {
        await this.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
    async getProfile(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });
    }
    async generateTokens(userId) {
        const tokenId = (0, uuid_1.v4)();
        const accessExpires = (process.env.JWT_ACCESS_EXPIRES_IN || '15m');
        const refreshExpires = (process.env.JWT_REFRESH_EXPIRES_IN || '30d');
        const accessToken = this.jwtService.sign({ sub: userId, type: 'access' }, { expiresIn: accessExpires });
        const refreshTokenValue = this.jwtService.sign({ sub: userId, type: 'refresh', tokenId }, { expiresIn: refreshExpires });
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await this.prisma.refreshToken.create({
            data: {
                tokenHash: this.hashToken(refreshTokenValue),
                userId,
                expiresAt,
            },
        });
        return { accessToken, refreshToken: refreshTokenValue };
    }
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map