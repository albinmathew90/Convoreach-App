import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { jsonColumnType, dateColumnType } from '../../../common/utils/column-types';
import { DateTransformer } from '../../../common/transformers/date.transformer';

export enum ConversationStatus {
  ACTIVE = 'active',
  REPLIED = 'replied',
  NOT_REPLIED = 'not_replied',
  INTERESTED = 'interested',
  FOLLOW_UP = 'follow_up',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

@Entity('inbox_conversations')
@Index('IDX_inbox_conv_sessionId', ['sessionId'])
@Index('IDX_inbox_conv_chatId_sessionId', ['chatId', 'sessionId'], { unique: true })
export class InboxConversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** OpenWA session that owns this conversation */
  @Column({ type: 'varchar' })
  sessionId: string;

  /** WhatsApp chat ID (e.g. 91XXXXXXXXXX@c.us) */
  @Index()
  @Column({ type: 'varchar' })
  chatId: string;

  /** Our CRM contact ID (optional link) */
  @Column({ type: 'varchar', nullable: true })
  contactId: string | null;

  /** ID of the campaign that initiated this conversation */
  @Column({ type: 'varchar', nullable: true })
  campaignId: string | null;

  /** ID of the template used to start this conversation */
  @Column({ type: 'varchar', nullable: true })
  templateId: string | null;

  /** Template name shown as badge in conversation list */
  @Column({ type: 'varchar', nullable: true })
  templateName: string | null;

  /** Contact display name (from OpenWA pushName or our CRM) */
  @Column({ type: 'varchar', nullable: true })
  contactName: string | null;

  /** Contact phone number in E.164 format */
  @Column({ type: 'varchar' })
  contactPhone: string;

  /** Profile picture URL (from OpenWA, may be null) */
  @Column({ type: 'varchar', nullable: true })
  profilePicUrl: string | null;

  /** Preview of the last message */
  @Column({ type: 'text', nullable: true })
  lastMessageBody: string | null;

  /** Direction of last message (incoming/outgoing) */
  @Column({ type: 'varchar', nullable: true })
  lastMessageDirection: string | null;

  /** Timestamp of the last message */
  @Column({ type: dateColumnType(), nullable: true, transformer: DateTransformer })
  lastMessageAt: Date | null;

  /** Number of unread incoming messages */
  @Column({ type: 'int', default: 0 })
  unreadCount: number;

  /** Conversation workflow status */
  @Column({ type: 'varchar', default: ConversationStatus.ACTIVE })
  status: ConversationStatus;

  /** Whether archived (hidden from main list unless Archived filter active) */
  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  /** Whether contact is blocked */
  @Column({ type: 'boolean', default: false })
  isBlocked: boolean;

  /** Operator-assigned tags */
  @Column({ type: jsonColumnType(), default: '[]' })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
