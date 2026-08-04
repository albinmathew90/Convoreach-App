import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Template } from './entities/template.entity';
import { CrmTemplate } from '../crm/entities/crm-template.entity';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Template, CrmTemplate], 'data'), ConfigModule],
  controllers: [TemplateController, AiController],
  providers: [TemplateService, AiService],
  exports: [TemplateService],
})
export class TemplateModule {}
