import { Controller, Post, Get, Param, Body, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TestsService } from './tests.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('tests')
export class TestsController {
  constructor(private testsService: TestsService) {}

  @Post('start')
  async start(@CurrentUser('id') userId: string, @Body() body: { categoryId: string }) {
    return this.testsService.startSession(userId, body.categoryId);
  }

  @Post(':sessionId/answer')
  async answer(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
    @Body() body: { questionId: string; answerId: string },
  ) {
    return this.testsService.answerQuestion(userId, sessionId, body.questionId, body.answerId);
  }

  @Post(':sessionId/finish')
  async finish(@CurrentUser('id') userId: string, @Param('sessionId') sessionId: string) {
    return this.testsService.finishSession(userId, sessionId);
  }

  @Get('history')
  async history(@CurrentUser('id') userId: string) {
    return this.testsService.getHistory(userId);
  }

  @Get(':sessionId')
  async getSession(@CurrentUser('id') userId: string, @Param('sessionId') sessionId: string) {
    return this.testsService.getSessionDetail(userId, sessionId);
  }
}
