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
exports.PracticeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const scene_util_1 = require("../../common/utils/scene.util");
let PracticeService = class PracticeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkAnswer(questionId, answerId) {
        const question = await this.prisma.question.findUnique({
            where: { id: questionId },
            include: {
                answers: {
                    include: { video: true },
                },
            },
        });
        if (!question)
            throw new common_1.NotFoundException('Savol topilmadi');
        const selectedAnswer = question.answers.find((a) => a.id === answerId);
        if (!selectedAnswer)
            throw new common_1.NotFoundException('Javob topilmadi');
        const correctAnswer = question.answers.find((a) => a.isCorrect);
        return {
            isCorrect: selectedAnswer.isCorrect,
            correctAnswerId: correctAnswer?.id || null,
            video: selectedAnswer.video
                ? {
                    playbackUrl: selectedAnswer.video.playbackUrl,
                    durationSec: selectedAnswer.video.durationSec,
                    type: selectedAnswer.video.type,
                }
                : null,
            scene: (0, scene_util_1.resolveSceneOutcome)(question.resolutionJson, selectedAnswer.optionKey, selectedAnswer.isCorrect),
        };
    }
};
exports.PracticeService = PracticeService;
exports.PracticeService = PracticeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PracticeService);
//# sourceMappingURL=practice.service.js.map