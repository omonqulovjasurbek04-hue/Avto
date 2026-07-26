import { Controller, Get, Post, Patch, Delete, Param, Body, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@Controller()
export class QuestionsController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Get('categories/:categoryId/questions')
  async findByCategory(@Param('categoryId') categoryId: string) {
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

  @Roles(Role.ADMIN)
  @Get('admin/questions/:id')
  async findOneAdmin(@Param('id') id: string) {
    const q = await this.prisma.question.findUnique({
      where: { id },
      include: {
        answers: {
          include: { video: true },
          orderBy: { id: 'asc' },
        },
      },
    });
    if (!q) throw new NotFoundException('Savol topilmadi');
    return q;
  }

  @Roles(Role.ADMIN)
  @Post('questions')
  async create(@Body() body: { categoryId: string; text: string; imageUrl?: string; order?: number }) {
    return this.prisma.question.create({
      data: {
        categoryId: body.categoryId,
        text: body.text,
        imageUrl: body.imageUrl,
        order: body.order || 0,
      },
    });
  }

  @Roles(Role.ADMIN)
  @Patch('questions/:id')
  async update(@Param('id') id: string, @Body() body: Partial<{ text: string; imageUrl: string; order: number }>) {
    return this.prisma.question.update({ where: { id }, data: body });
  }

  @Roles(Role.ADMIN)
  @Delete('questions/:id')
  async remove(@Param('id') id: string) {
    await this.prisma.question.delete({ where: { id } });
    return { ok: true };
  }

  @Roles(Role.ADMIN)
  @Post('questions/:id/answers')
  async addAnswer(
    @Param('id') questionId: string,
    @Body() body: { text: string; isCorrect: boolean; videoId?: string },
  ) {
    return this.prisma.answer.create({
      data: {
        questionId,
        text: body.text,
        isCorrect: body.isCorrect,
        videoId: body.videoId,
      },
    });
  }

  @Roles(Role.ADMIN)
  @Patch('answers/:id')
  async updateAnswer(
    @Param('id') id: string,
    @Body() body: Partial<{ text: string; isCorrect: boolean; videoId: string }>,
  ) {
    return this.prisma.answer.update({ where: { id }, data: body });
  }
}
