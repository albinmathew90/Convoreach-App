import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../crm/entities/user.entity';
import { jsonColumnType } from '../../../common/utils/column-types';

export type BroadcastStatus =
  | 'draft'
  | 'scheduled'
  | 'queued'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type BroadcastMessageType = 'template' | 'text' | 'image' | 'video' | 'file';

@Entity('broadcasts')
export class Broadcast {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status: BroadcastStatus;

  @Column({ type: 'varchar', length: 20, default: 'template' })
  messageType: BroadcastMessageType;

  // Audience
  @Column({ type: jsonColumnType(), default: '[]' })
  segmentIds: string[];

  @Column({ type: jsonColumnType(), default: '[]' })
  excludeSegmentIds: string[];

  @Column({ type: jsonColumnType(), default: '[]' })
  excludeContactIds: string[];

  @Column({ type: 'boolean', default: false })
  skipActiveWindow: boolean;

  // Message payload
  @Column({ type: 'uuid', nullable: true })
  templateId?: string;

  @Column({ type: jsonColumnType(), nullable: true })
  templateVariables?: Record<string, string>;

  @Column({ type: 'text', nullable: true })
  simpleText?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  mediaUrl?: string;

  // Schedule
  @Column({ type: 'varchar', length: 20, default: 'instant' })
  scheduleType: 'instant' | 'scheduled';

  @Column({ type: 'varchar', nullable: true })
  scheduledAt?: string;

  // Batching
  @Column({ type: jsonColumnType(), default: '[]' })
  batches: Array<{
    startContact: number;
    endContact: number;
    delaySeconds: number;
  }>;

  // Retry
  @Column({ type: 'boolean', default: false })
  retryEnabled: boolean;

  @Column({ type: 'int', default: 1 })
  retryCount: number;

  @Column({ type: 'int', default: 24 })
  retryIntervalHours: number;

  // Session
  @Column({ type: 'varchar', nullable: true })
  sessionId?: string;

  // Stats (denormalized for speed)
  @Column({ type: 'int', default: 0 })
  totalCount: number;

  @Column({ type: 'int', default: 0 })
  queuedCount: number;

  @Column({ type: 'int', default: 0 })
  sentCount: number;

  @Column({ type: 'int', default: 0 })
  deliveredCount: number;

  @Column({ type: 'int', default: 0 })
  readCount: number;

  @Column({ type: 'int', default: 0 })
  failedCount: number;

  @Column({ type: 'int', default: 0 })
  skippedCount: number;

  @Column({ type: 'int', default: 0 })
  retryAttempts: number;

  @Column({ type: 'varchar', nullable: true })
  startedAt?: string;

  @Column({ type: 'varchar', nullable: true })
  completedAt?: string;

  @Column({ type: 'boolean', default: false })
  isSleeping: boolean;

  @Column({ type: 'varchar', nullable: true })
  sleepUntil?: string;

  @Column({ type: 'varchar', nullable: true })
  sleepReason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => BroadcastRecipient, (r) => r.broadcast, { cascade: false })
  recipients: BroadcastRecipient[];
}

export type RecipientStatus =
  | 'queued'
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'retrying'
  | 'skipped';

@Entity('broadcast_recipients')
export class BroadcastRecipient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  broadcastId: string;

  @ManyToOne(() => Broadcast, (b) => b.recipients, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'broadcastId' })
  broadcast: Broadcast;

  @Column({ type: 'varchar', length: 200 })
  contactId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name?: string;

  @Column({ type: 'varchar', length: 20, default: 'queued' })
  status: RecipientStatus;

  @Column({ type: 'varchar', nullable: true })
  messageId?: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'text', nullable: true })
  errorReason?: string;

  @Column({ type: 'varchar', nullable: true })
  sentAt?: string;

  @Column({ type: 'varchar', nullable: true })
  deliveredAt?: string;

  @Column({ type: 'varchar', nullable: true })
  readAt?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('broadcast_activity_logs')
export class BroadcastActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  broadcastId: string;

  @Column({ type: 'varchar', length: 50 })
  action: string;

  @Column({ type: 'text', nullable: true })
  detail?: string;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @CreateDateColumn()
  createdAt: Date;
}
