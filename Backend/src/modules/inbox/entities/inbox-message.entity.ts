import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { jsonColumnType } from '../../../common/utils/column-types';
import { InboxConversation } from './inbox-conversation.entity';
import { bigintToNumberTransformer } from '../../message/entities/message.entity';

export enum InboxMessageDirection {
  INCOMING = 'incoming',
  OUTGOING = 'outgoing',
}

export enum InboxMessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  VOICE = 'voice',
  STICKER = 'sticker',
  LOCATION = 'location',
  CONTACT_CARD = 'contact_card',
  UNKNOWN = 'unknown',
}

export enum InboxMessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

@Entity('inbox_messages')
@Index('IDX_inbox_msg_conversationId', ['conversationId'])
@Index('IDX_inbox_msg_sessionId_waId', ['sessionId', 'waMessageId'], { unique: true, where: 'wa_message_id IS NOT NULL' })
export class InboxMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** FK to the inbox conversation this message belongs to */
  @Column({ type: 'uuid' })
  conversationId: string;

  @ManyToOne(() => InboxConversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: InboxConversation;

  /** WhatsApp message ID (e.g. 3EB0...) — null for optimistic messages before send confirmation */
  @Column({ name: 'wa_message_id', type: 'varchar', nullable: true })
  waMessageId: string | null;

  /** OpenWA session ID */
  @Column({ type: 'varchar' })
  sessionId: string;

  /** Message direction */
  @Column({ type: 'varchar', default: InboxMessageDirection.OUTGOING })
  direction: InboxMessageDirection;

  /** Message type */
  @Column({ type: 'varchar', default: InboxMessageType.TEXT })
  type: InboxMessageType;

  /** Text body (null for media-only messages) */
  @Column({ type: 'text', nullable: true })
  body: string | null;

  /** Caption for media messages */
  @Column({ type: 'text', nullable: true })
  caption: string | null;

  /** URL or base64 of media (stored URL after download) */
  @Column({ type: 'text', nullable: true })
  mediaUrl: string | null;

  /** Original filename for documents */
  @Column({ type: 'varchar', nullable: true })
  mediaName: string | null;

  /** MIME type of media */
  @Column({ type: 'varchar', nullable: true })
  mediaMimeType: string | null;

  /** Media file size in bytes */
  @Column({ type: 'int', nullable: true })
  mediaSize: number | null;

  /** Duration in seconds for audio/video */
  @Column({ type: 'int', nullable: true })
  mediaDuration: number | null;

  /** Quoted message ID (for reply-to) */
  @Column({ type: 'varchar', nullable: true })
  quotedMessageId: string | null;

  /** Preview text of quoted message */
  @Column({ type: 'text', nullable: true })
  quotedBody: string | null;

  /** WA epoch timestamp (seconds) */
  @Column({ type: 'bigint', nullable: true, transformer: bigintToNumberTransformer })
  timestamp: number | null;

  /** Delivery/read status */
  @Column({ type: 'varchar', default: InboxMessageStatus.SENT })
  status: InboxMessageStatus;

  /** Raw metadata from OpenWA (reactions, mentions, etc.) */
  @Column({ type: jsonColumnType(), nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;
}
