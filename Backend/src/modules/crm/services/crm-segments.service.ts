import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrmSegment } from '../entities/crm-segment.entity';
import { CreateCrmSegmentDto } from '../dto/crm.dto';

@Injectable()
export class CrmSegmentsService {
  constructor(
    @InjectRepository(CrmSegment, 'data')
    private segmentsRepository: Repository<CrmSegment>,
  ) {}

  async create(userId: string, dto: CreateCrmSegmentDto): Promise<CrmSegment> {
    const segment = this.segmentsRepository.create({
      ...dto,
      userId,
    });
    return this.segmentsRepository.save(segment);
  }

  async findAll(userId: string): Promise<CrmSegment[]> {
    return this.segmentsRepository.find({ where: { userId } });
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.segmentsRepository.delete({ id, userId });
  }
}
