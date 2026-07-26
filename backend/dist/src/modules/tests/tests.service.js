"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let TestsService = class TestsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async startSession(userId, categoryId) {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
            include: { questions: { take: 1, orderBy: { order: 'asc' }, select: { id: true, text: true, imageUrl: true, answers: { select: { id: true, text: true } } } } },
        });
        if (!category)
            throw new common_1.NotFoundException('Kategoriya topilmadi');
        const session = await this.prisma.testSession.create({
            data: { userId, categoryId },
        });
        return {
            sessionId: session.id,
            categoryId: session.categoryId,
            question: category.questions[0] || null,
            total: await this.prisma.question.count({ where: { categoryId } }),
        };
    }
    async answerQuestion(userId, sessionId, questionId, answerId) {
        const session = await this.prisma.testSession.findUnique({
            where: { id: sessionId },
            include: { answers: true },
        });
        if (!session)
            throw new common_1.NotFoundException('Test sessiyasi topilmadi');
        if (session.userId !== userId)
            throw new common_1.ForbiddenException('Bu sizning sessiyangiz emas');
        if (session.finishedAt)
            throw new common_1.BadRequestException('Sessiya tugatilgan');
        const alreadyAnswered = session.answers.find((a) => a.questionId === questionId);
        if (alreadyAnswered)
            throw new common_1.BadRequestException('Bu savolga allaqachon javob berilgan');
        const answer = await this.prisma.answer.findUnique({
            where: { id: answerId },
            include: {
                video: { select: { playbackUrl: true, durationSec: true, type: true } },
                question: { include: { answers: { select: { id: true, text: true } } } },
            },
        });
        if (!answer || answer.questionId !== questionId) {
            throw new common_1.NotFoundException('Javob topilmadi');
        }
        await this.prisma.testSessionAnswer.create({
            data: { sessionId, questionId, answerId, isCorrect: answer.isCorrect },
        });
        const nextQuestion = await this.prisma.question.findFirst({
            where: {
                categoryId: session.categoryId,
                order: { gt: answer.question.order },
            },
            orderBy: { order: 'asc' },
            select: { id: true, text: true, imageUrl: true, answers: { select: { id: true, text: true } } },
        });
        return {
            isCorrect: answer.isCorrect,
            video: answer.video
                ? { playbackUrl: answer.video.playbackUrl, durationSec: answer.video.durationSec, type: answer.video.type }
                : null,
            nextQuestion,
        };
    }
    async finishSession(userId, sessionId) {
        const session = await this.prisma.testSession.findUnique({
            where: { id: sessionId },
            include: { answers: true },
        });
        if (!session)
            throw new common_1.NotFoundException('Test sessiyasi topilmadi');
        if (session.userId !== userId)
            throw new common_1.ForbiddenException();
        if (session.finishedAt)
            throw new common_1.BadRequestException('Sessiya tugatilgan');
        const totalCount = session.answers.length;
        const totalScore = session.answers.filter((a) => a.isCorrect).length;
        const percentage = totalCount > 0 ? Math.round((totalScore / totalCount) * 100) : 0;
        await this.prisma.testSession.update({
            where: { id: sessionId },
            data: { finishedAt: new Date(), totalScore, totalCount },
        });
        return { score: totalScore, total: totalCount, percentage };
    }
    async getHistory(userId) {
        return this.prisma.testSession.findMany({
            where: { userId },
            orderBy: { startedAt: 'desc' },
            include: {
                category: { select: { id: true, name: true } },
                _count: { select: { answers: true } },
            },
        });
    }
    async getSessionDetail(userId, sessionId) {
        const session = await this.prisma.testSession.findUnique({
            where: { id: sessionId },
            include: {
                category: { select: { id: true, name: true } },
                answers: {
                    include: {
                        question: { select: { id: true, text: true } },
                        answer: { select: { id: true, text: true, isCorrect: true } },
                    },
                    orderBy: { answeredAt: 'asc' },
                },
            },
        });
        if (!session)
            throw new common_1.NotFoundException('Sessiya topilmadi');
        if (session.userId !== userId)
            throw new common_1.ForbiddenException();
        return session;
    }
};
exports.TestsService = TestsService;
exports.TestsService = TestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TestsService);
//# sourceMappingURL=tests.service.js.map