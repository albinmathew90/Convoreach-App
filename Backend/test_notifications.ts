import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { MessageService } from './src/modules/message/message.service';
import { SessionService } from './src/modules/session/session.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const sessionService = app.get(SessionService);
  const messageService = app.get(MessageService);

  // We don't know req.user.id, so let's just get all sessions
  const sessions = await sessionService.findAll();
  console.log('Sessions found:', sessions.length);

  const sessionIds = sessions.map(s => s.id);
  const msgs = await messageService.getRecentIncomingMessages(sessionIds, 20);
  console.log('Recent notifications:', msgs.length);
  console.log(msgs.map(m => ({ id: m.id, from: m.from, body: m.body, dir: m.direction })));

  await app.close();
}

bootstrap().catch(console.error);
