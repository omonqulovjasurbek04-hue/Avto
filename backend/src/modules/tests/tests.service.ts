import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { parseScene, resolveSceneOutcome } from '../../common/utils/scene.util';

const QUESTION_SELECT = {
  id: true,
  text: true,
  imageUrl: true,
  order: true,
  sceneJson: true,
  answers: { select: { id: true, text: true } },
} as const;

function toPublicQuestion(q: ({ sceneJson?: string | null } & Record<string, any>) | null) {
  if (!q) return null;
  const { sceneJson, ...rest } = q;
  return { ...rest, ...parseScene(sceneJson) };
}

@Injectable()
export class TestsService {
  constructor(private prisma: PrismaService) {}

  async startSession(userId: string, categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      include: { questions: { take: 1, orderBy: { order: 'asc' }, select: QUESTION_SELECT } },
    });
    if (!category) throw new NotFoundException('Kategoriya topilmadi');

    const session = await this.prisma.testSession.create({
      data: { userId, categoryId },
    });

    return {
      sessionId: session.id,
      categoryId: session.categoryId,
      question: toPublicQuestion(category.questions[0]),
      total: await this.prisma.question.count({ where: { categoryId } }),
    };
  }

  async answerQuestion(userId: string, sessionId: string, questionId: string, answerId: string) {
    const session = await this.prisma.testSession.findUnique({
      where: { id: sessionId },
      include: { answers: true },
    });
    if (!session) throw new NotFoundException('Test sessiyasi topilmadi');
    if (session.userId !== userId) throw new ForbiddenException('Bu sizning sessiyangiz emas');
    if (session.finishedAt) throw new BadRequestException('Sessiya tugatilgan');

    const alreadyAnswered = session.answers.find((a) => a.questionId === questionId);
    if (alreadyAnswered) throw new BadRequestException('Bu savolga allaqachon javob berilgan');

    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
      include: {
        video: { select: { playbackUrl: true, durationSec: true, type: true } },
        question: { select: { order: true, resolutionJson: true } },
      },
    });
    if (!answer || answer.questionId !== questionId) {
      throw new NotFoundException('Javob topilmadi');
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
      select: QUESTION_SELECT,
    });

    return {
      isCorrect: answer.isCorrect,
      video: answer.video
        ? { playbackUrl: answer.video.playbackUrl, durationSec: answer.video.durationSec, type: answer.video.type }
        : null,
      scene: resolveSceneOutcome(answer.question.resolutionJson, answer.optionKey, answer.isCorrect),
      nextQuestion: toPublicQuestion(nextQuestion),
    };
  }

  async finishSession(userId: string, sessionId: string) {
    const session = await this.prisma.testSession.findUnique({
      where: { id: sessionId },
      include: { answers: true },
    });
    if (!session) throw new NotFoundException('Test sessiyasi topilmadi');
    if (session.userId !== userId) throw new ForbiddenException();
    if (session.finishedAt) throw new BadRequestException('Sessiya tugatilgan');

    const totalCount = session.answers.length;
    const totalScore = session.answers.filter((a) => a.isCorrect).length;
    const percentage = totalCount > 0 ? Math.round((totalScore / totalCount) * 100) : 0;

    await this.prisma.testSession.update({
      where: { id: sessionId },
      data: { finishedAt: new Date(), totalScore, totalCount },
    });

    return { score: totalScore, total: totalCount, percentage };
  }

  async getHistory(userId: string) {
    return this.prisma.testSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { answers: true } },
      },
    });
  }

  async getSessionDetail(userId: string, sessionId: string) {
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
    if (!session) throw new NotFoundException('Sessiya topilmadi');
    if (session.userId !== userId) throw new ForbiddenException();
    return session;
  }
}
