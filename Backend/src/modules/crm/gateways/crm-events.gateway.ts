import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { resolveCorsPolicy } from '../../../config/bootstrap-security';
import { Message } from '../../message/entities/message.entity';
import { HookManager } from '../../../core/hooks';
import { SessionService } from '../../session/session.service';

function resolveWsCorsOrigin(): boolean | string[] {
  const policy = resolveCorsPolicy(process.env.CORS_ORIGINS, process.env.NODE_ENV);
  return policy.allowAnyOrigin ? true : policy.origins;
}

@WebSocketGateway({
  cors: {
    origin: resolveWsCorsOrigin(),
  },
  namespace: '/crm-events',
})
export class CrmEventsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('CrmEventsGateway');
  // Store a mapping of userId to a set of sockets
  private readonly userSockets = new Map<string, Set<Socket>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly hookManager: HookManager,
    private readonly sessionService: SessionService,
  ) {}

  onModuleInit() {
    this.hookManager.register(
      'crm-notification-emitter',
      'message:received',
      async (ctx) => {
        const message = ctx.data as Message;
        const sessionId = ctx.sessionId;
        try {
          if (sessionId) {
            const session = await this.sessionService.findOne(sessionId);
            if (session && session.userId) {
              this.emitNotification(session.userId, message);
            }
          }
        } catch (error) {
          this.logger.error(`Failed to emit notification for message ${message.id}`, error);
        }
        return { continue: true, data: message };
      }
    );
  }

  async handleConnection(client: Socket) {
    const token =
      client.handshake.auth?.token ||
      (client.handshake.headers['authorization']?.startsWith('Bearer ')
        ? client.handshake.headers['authorization'].split(' ')[1]
        : undefined);

    if (!token) {
      this.logger.warn(`Client ${client.id} rejected: No token provided`);
      client.emit('error', 'Token required');
      client.disconnect();
      return;
    }

    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'fallback_secret_for_crm_openwa',
      });
      const userId = decoded.id;
      
      // Store user id in socket data
      client.data.userId = userId;

      let sockets = this.userSockets.get(userId);
      if (!sockets) {
        sockets = new Set();
        this.userSockets.set(userId, sockets);
      }
      sockets.add(client);
      
      // Join a room specific to this user so we can emit to them easily
      void client.join(`user:${userId}`);

      this.logger.log(`CRM Client connected: ${client.id} (User: ${userId})`);
    } catch (error) {
      this.logger.warn(`CRM Client ${client.id} rejected: Invalid token`, error);
      client.emit('error', 'Authentication failed');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    }
    this.logger.log(`CRM Client disconnected: ${client.id}`);
  }

  /**
   * Emit a new notification to a specific user
   */
  emitNotification(userId: string, message: Message) {
    this.server.to(`user:${userId}`).emit('notification.received', message);
  }
}
