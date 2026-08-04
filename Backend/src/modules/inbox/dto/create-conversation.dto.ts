import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({ description: 'WhatsApp chat ID (e.g. 91XXXXXXXXXX@c.us)' })
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @ApiPropertyOptional({ description: 'Our CRM contact ID' })
  @IsString()
  @IsOptional()
  contactId?: string;

  @ApiPropertyOptional({ description: 'Campaign ID that initiated this conversation' })
  @IsString()
  @IsOptional()
  campaignId?: string;

  @ApiPropertyOptional({ description: 'Template ID used for the opening message' })
  @IsString()
  @IsOptional()
  templateId?: string;

  @ApiPropertyOptional({ description: 'Template name for display' })
  @IsString()
  @IsOptional()
  templateName?: string;

  @ApiPropertyOptional({ description: 'Contact display name' })
  @IsString()
  @IsOptional()
  contactName?: string;

  @ApiProperty({ description: 'Contact phone in E.164 or WhatsApp format' })
  @IsString()
  @IsNotEmpty()
  contactPhone: string;

  @ApiPropertyOptional({ description: 'Initial message body that was sent' })
  @IsString()
  @IsOptional()
  initialMessageBody?: string;
}
