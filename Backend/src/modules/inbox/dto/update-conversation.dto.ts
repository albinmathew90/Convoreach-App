import { IsString, IsOptional, IsBoolean, IsArray, IsIn, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ConversationStatus } from '../entities/inbox-conversation.entity';

export class UpdateConversationDto {
  @ApiPropertyOptional({ enum: ConversationStatus })
  @IsString()
  @IsIn(Object.values(ConversationStatus))
  @IsOptional()
  status?: ConversationStatus;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isBlocked?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  contactName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  profilePicUrl?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  unreadCount?: number;
}

export class AddTagDto {
  @ApiPropertyOptional()
  @IsString()
  tag: string;
}

export class RemoveTagDto {
  @ApiPropertyOptional()
  @IsString()
  tag: string;
}
