import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrmTemplate } from '../entities/crm-template.entity';
import { CreateCrmTemplateDto } from '../dto/crm.dto';

@Injectable()
export class CrmTemplatesService {
  constructor(
    @InjectRepository(CrmTemplate, 'data')
    private templatesRepository: Repository<CrmTemplate>,
  ) {}

  async create(userId: string, dto: CreateCrmTemplateDto): Promise<CrmTemplate> {
    const template = this.templatesRepository.create({
      ...dto,
      userId,
    });
    return this.templatesRepository.save(template);
  }

  async findAll(userId: string): Promise<CrmTemplate[]> {
    return this.templatesRepository.find({ where: { userId } });
  }

  async findOne(userId: string, id: string): Promise<CrmTemplate | null> {
    return this.templatesRepository.findOne({ where: { id, userId } });
  }

  async update(userId: string, id: string, dto: CreateCrmTemplateDto): Promise<CrmTemplate | null> {
    const template = await this.templatesRepository.findOne({ where: { id, userId } });
    if (!template) return null;
    Object.assign(template, dto);
    return this.templatesRepository.save(template);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.templatesRepository.delete({ id, userId });
  }

  async bulkCreate(userId: string, dtos: CreateCrmTemplateDto[]): Promise<CrmTemplate[]> {
    const templatesToSave = dtos.map(dto => this.templatesRepository.create({ ...dto, userId }));
    return this.templatesRepository.save(templatesToSave);
  }
}
