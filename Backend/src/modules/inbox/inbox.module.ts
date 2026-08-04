import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InboxConversation } from './entities/inbox-conversation.entity';
import { InboxMessage } from './entities/inbox-message.entity';
import { InboxService } from './inbox.service';
import { InboxController } from './inbox.controller';
import { MessageModule } from '../message/message.module';
import { HooksModule } from '../../core/hooks';
import { CrmModule } from '../crm/crm.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InboxConversation, InboxMessage], 'data'),
    MessageModule,
    HooksModule,
    CrmModule,
  ],
  controllers: [InboxController],
  providers: [InboxService],
  exports: [InboxService],
})
export class InboxModule {}

