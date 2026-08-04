import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrmTag } from '../entities/crm-tag.entity';
import { CreateCrmTagDto } from '../dto/crm.dto';

@Injectable()
export class CrmTagsService {
  constructor(
    @InjectRepository(CrmTag, 'data')
    private tagsRepository: Repository<CrmTag>,
  ) {}

  async create(userId: string, dto: CreateCrmTagDto): Promise<CrmTag> {
    const tag = this.tagsRepository.create({
      ...dto,
      userId,
    });
    return this.tagsRepository.save(tag);
  }

  async findAll(userId: string): Promise<CrmTag[]> {
    return this.tagsRepository.find({ where: { userId } });
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.tagsRepository.delete({ id, userId });
  }
}
