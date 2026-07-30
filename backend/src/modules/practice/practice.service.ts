import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { resolveSceneOutcome } from '../../common/utils/scene.util';

@Injectable()
export class PracticeService {
  constructor(private prisma: PrismaService) {}

  async checkAnswer(questionId: string, answerId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        answers: {
          include: { video: true },
        },
      },
    });

    if (!question) throw new NotFoundException('Savol topilmadi');

    const selectedAnswer = question.answers.find((a) => a.id === answerId);
    if (!selectedAnswer) throw new NotFoundException('Javob topilmadi');

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
      scene: resolveSceneOutcome(question.resolutionJson, selectedAnswer.optionKey, selectedAnswer.isCorrect),
    };
  }
}
