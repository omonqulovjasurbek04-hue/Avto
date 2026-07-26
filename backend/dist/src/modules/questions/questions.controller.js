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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let QuestionsController = class QuestionsController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByCategory(categoryId) {
        const questions = await this.prisma.question.findMany({
            where: { categoryId },
            orderBy: { order: 'asc' },
            select: {
                id: true,
                text: true,
                imageUrl: true,
                order: true,
                answers: {
                    select: { id: true, text: true },
                    orderBy: { id: 'asc' },
                },
            },
        });
        return questions;
    }
    async findOneAdmin(id) {
        const q = await this.prisma.question.findUnique({
            where: { id },
            include: {
                answers: {
                    include: { video: true },
                    orderBy: { id: 'asc' },
                },
            },
        });
        if (!q)
            throw new common_1.NotFoundException('Savol topilmadi');
        return q;
    }
    async create(body) {
        return this.prisma.question.create({
            data: {
                categoryId: body.categoryId,
                text: body.text,
                imageUrl: body.imageUrl,
                order: body.order || 0,
            },
        });
    }
    async update(id, body) {
        return this.prisma.question.update({ where: { id }, data: body });
    }
    async remove(id) {
        await this.prisma.question.delete({ where: { id } });
        return { ok: true };
    }
    async addAnswer(questionId, body) {
        return this.prisma.answer.create({
            data: {
                questionId,
                text: body.text,
                isCorrect: body.isCorrect,
                videoId: body.videoId,
            },
        });
    }
    async updateAnswer(id, body) {
        return this.prisma.answer.update({ where: { id }, data: body });
    }
};
exports.QuestionsController = QuestionsController;
__decorate([
    (0, common_1.Get)('categories/:categoryId/questions'),
    __param(0, (0, common_1.Param)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "findByCategory", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Get)('admin/questions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "findOneAdmin", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Post)('questions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "create", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Patch)('questions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Delete)('questions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "remove", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Post)('questions/:id/answers'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "addAnswer", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Patch)('answers/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuestionsController.prototype, "updateAnswer", null);
exports.QuestionsController = QuestionsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuestionsController);
//# sourceMappingURL=questions.controller.js.map