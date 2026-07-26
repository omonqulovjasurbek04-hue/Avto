import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { order: 'asc' },
      select: { id: true, name: true, slug: true, order: true, _count: { select: { questions: true } } },
    });
  }
}
