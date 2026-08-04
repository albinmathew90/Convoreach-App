import { IsString, IsOptional, IsNotEmpty, IsIn, IsBase64, IsNumber, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type ReplyType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'voice' | 'template';

export class SendReplyDto {
  @ApiProperty({ description: 'Type of message to send', enum: ['text', 'image', 'video', 'audio', 'document', 'voice', 'template'] })
  @IsString()
  @IsIn(['text', 'image', 'video', 'audio', 'document', 'voice', 'template'])
  type: ReplyType;

  @ApiPropertyOptional({ description: 'Text body (required for type=text, optional caption for media)' })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional({ description: 'Base64-encoded media content (for image/video/audio/document/voice)' })
  @IsString()
  @IsOptional()
  mediaBase64?: string;

  @ApiPropertyOptional({ description: 'Media filename (for document)' })
  @IsString()
  @IsOptional()
  mediaName?: string;

  @ApiPropertyOptional({ description: 'MIME type of the media' })
  @IsString()
  @IsOptional()
  mimeType?: string;

  @ApiPropertyOptional({ description: 'Message ID to quote/reply to' })
  @IsString()
  @IsOptional()
  quotedMessageId?: string;

  @ApiPropertyOptional({ description: 'Preview text of quoted message (for display only)' })
  @IsString()
  @IsOptional()
  quotedBody?: string;

  @ApiPropertyOptional({ description: 'Template ID (resolves template body if provided)' })
  @IsString()
  @IsOptional()
  templateId?: string;

  @ApiPropertyOptional({ description: 'Template name (alternative to templateId for resolution)' })
  @IsString()
  @IsOptional()
  templateName?: string;

  @ApiPropertyOptional({ description: 'Template variables' })
  @IsObject()
  @IsOptional()
  vars?: Record<string, string>;
}
