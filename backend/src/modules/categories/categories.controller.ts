import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('categories')
export class CategoriesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll() {
    const categories = await this.prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { questions: true } } },
    });
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      order: c.order,
      _count: { questions: c._count.questions },
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const cat = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { questions: true } } },
    });
    if (!cat) return { error: 'Kategoriya topilmadi' };
    return cat;
  }

  @Roles(Role.ADMIN)
  @Post()
  async create(@Body() body: { name: string; slug: string; order?: number }) {
    return this.prisma.category.create({
      data: { name: body.name, slug: body.slug, order: body.order || 0 },
    });
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: Partial<{ name: string; slug: string; order: number }>) {
    return this.prisma.category.update({ where: { id }, data: body });
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.prisma.category.delete({ where: { id } });
    return { ok: true };
  }
}
