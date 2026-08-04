import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, IsEnum, IsInt, IsUUID, Min, Max, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BatchItemDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  startContact: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  endContact: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  delaySeconds: number;
}

export class CreateBroadcastDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  segmentIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  excludeSegmentIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  excludeContactIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  skipActiveWindow?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['template', 'text', 'image', 'video', 'file'])
  messageType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  templateVariables?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  simpleText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['instant', 'scheduled'])
  scheduleType?: 'instant' | 'scheduled';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scheduledAt?: string;

  @ApiPropertyOptional({ type: [BatchItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchItemDto)
  batches?: BatchItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  retryEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  retryCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  retryIntervalHours?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class UpdateBroadcastDto extends CreateBroadcastDto {}
