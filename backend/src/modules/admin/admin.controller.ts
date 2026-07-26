import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('stats')
  async stats() {
    const [users, questions, sessions, videos] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.question.count(),
      this.prisma.testSession.count(),
      this.prisma.video.count(),
    ]);

    const avgResult = await this.prisma.testSession.aggregate({
      _avg: { totalScore: true },
      where: { finishedAt: { not: null } },
    });

    const categories = await this.prisma.category.count();
    const answers = await this.prisma.answer.count();

    return {
      users,
      questions,
      answers,
      categories,
      videos,
      testSessions: sessions,
      avgScore: Math.round((avgResult._avg.totalScore || 0) * 100) / 100,
    };
  }

  @Get('videos')
  async listVideos() {
    return this.prisma.video.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { answers: true } } },
    });
  }
}
