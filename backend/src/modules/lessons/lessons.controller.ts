import { Controller, Get, Param } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Public()
  @Get()
  findAll() {
    return this.lessonsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }
}
