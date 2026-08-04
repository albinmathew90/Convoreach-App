import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrmCustomField } from '../entities/crm-custom-field.entity';
import { CreateCrmCustomFieldDto, UpdateCrmCustomFieldDto } from '../dto/crm.dto';

@Injectable()
export class CrmCustomFieldsService {
  constructor(
    @InjectRepository(CrmCustomField, 'data')
    private customFieldsRepository: Repository<CrmCustomField>,
  ) {}

  async create(userId: string, dto: CreateCrmCustomFieldDto): Promise<CrmCustomField> {
    const field = this.customFieldsRepository.create({
      ...dto,
      userId,
    });
    return this.customFieldsRepository.save(field);
  }

  async findAll(userId: string): Promise<CrmCustomField[]> {
    return this.customFieldsRepository.find({ where: { userId } });
  }

  async update(userId: string, id: string, dto: UpdateCrmCustomFieldDto): Promise<CrmCustomField> {
    const field = await this.customFieldsRepository.findOne({ where: { id, userId } });
    if (!field) throw new NotFoundException('Custom field not found');
    Object.assign(field, dto);
    return this.customFieldsRepository.save(field);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.customFieldsRepository.delete({ id, userId });
  }
}
