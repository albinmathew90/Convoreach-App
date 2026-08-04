import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { Public } from '../auth/decorators/auth.decorators';

@ApiTags('ai')
@Controller('ai/templates')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  @Public()
  @ApiOperation({ summary: 'Generate template content using AI' })
  @ApiResponse({ status: 200, description: 'Generated template JSON' })
  async generate(@Body() body: { prompt: string; assistant: string }) {
    return this.aiService.generateTemplate(body.prompt, body.assistant);
  }
}
