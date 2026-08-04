import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { jsonColumnType } from '../../../common/utils/column-types';

/**
 * Tracks the per-chat state while a flow is executing.
 * One row per (userId + sessionId + chatId) — upserted on every step.
 * Rows older than sessionExpiryMinutes are pruned by FlowRunnerService.
 */
@Entity('crm_flow_states')
@Index(['userId', 'sessionId', 'chatId'], { unique: true })
export class CrmFlowState {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  sessionId: string;

  @Column({ type: 'varchar', length: 200 })
  chatId: string;

  @Column({ type: 'uuid' })
  flowId: string;

  @Column({ type: 'varchar', length: 100 })
  currentNodeId: string;

  /** Variables captured by Ask Question / Ask Location nodes */
  @Column({ type: jsonColumnType(), default: '{}' })
  vars: Record<string, string>;

  /** Whether we are waiting for the user to reply to a capture node */
  @Column({ type: 'boolean', default: false })
  waitingForReply: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
