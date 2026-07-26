import { Controller, Post, Body } from '@nestjs/common';
import { PracticeService } from './practice.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('practice')
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Public()
  @Post('check')
  async checkAnswer(@Body() body: { questionId: string; answerId: string }) {
    return this.practiceService.checkAnswer(body.questionId, body.answerId);
  }
}
