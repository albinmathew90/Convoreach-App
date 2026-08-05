// ─── Conversation ─────────────────────────────────────────────────────────

export type ConversationStatus =
  | 'active'
  | 'replied'
  | 'not_replied'
  | 'interested'
  | 'follow_up'
  | 'closed'
  | 'archived';

export type InboxFilter =
  | 'all'
  | 'unread'
  | 'replied'
  | 'not_replied'
  | 'interested'
  | 'follow_up'
  | 'closed'
  | 'archived'
  | 'tagged';

export interface InboxConversation {
  id: string;
  sessionId: string;
  chatId: string;
  contactId: string | null;
  campaignId: string | null;
  templateId: string | null;
  templateName: string | null;
  contactName: string | null;
  contactPhone: string;
  profilePicUrl: string | null;
  lastMessageBody: string | null;
  lastMessageDirection: 'incoming' | 'outgoing' | null;
  lastMessageAt: string | null;
  unreadCount: number;
  status: ConversationStatus;
  isArchived: boolean;
  isBlocked: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Messages ────────────────────────────────────────────────────────────

export type MessageDirection = 'incoming' | 'outgoing';

export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'voice'
  | 'document'
  | 'sticker'
  | 'location'
  | 'contact_card'
  | 'unknown';

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface InboxMessage {
  id: string;
  conversationId: string;
  waMessageId: string | null;
  sessionId: string;
  direction: MessageDirection;
  type: MessageType;
  body: string | null;
  caption: string | null;
  mediaUrl: string | null;
  mediaName: string | null;
  mediaMimeType: string | null;
  mediaSize: number | null;
  mediaDuration: number | null;
  quotedMessageId: string | null;
  quotedBody: string | null;
  timestamp: number | null;
  status: MessageStatus;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  // Optimistic local flag
  isOptimistic?: boolean;
}

// ─── API Payloads ─────────────────────────────────────────────────────────

export interface CreateConversationPayload {
  chatId: string;
  contactId?: string;
  campaignId?: string;
  templateId?: string;
  templateName?: string;
  contactName?: string;
  contactPhone: string;
  initialMessageBody?: string;
}

export interface SendReplyPayload {
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'voice' | 'template';
  text?: string;
  mediaBase64?: string;
  mediaName?: string;
  mimeType?: string;
  quotedMessageId?: string;
  quotedBody?: string;
  templateId?: string;
  templateName?: string;
  vars?: Record<string, string>;
}

// ─── SSE Events ───────────────────────────────────────────────────────────

export type InboxEventType =
  | 'conversation_created'
  | 'conversation_updated'
  | 'message_received'
  | 'message_sent';

export interface InboxSSEEvent {
  type: InboxEventType;
  sessionId: string;
  conversationId: string;
  data: unknown;
}

// ─── UI State ─────────────────────────────────────────────────────────────

export interface InboxUIState {
  selectedConversationId: string | null;
  filter: InboxFilter;
  search: string;
  sidebarOpen: boolean;
}

// ─── Template (from localStorage) ────────────────────────────────────────

export interface CRMTemplateButton {
  type: 'quick_reply' | 'url' | 'phone' | string;
  text: string;
  value?: string;
}

export interface CRMTemplateContent {
  buttons?: CRMTemplateButton[];
  mediaUrl?: string;
}

export interface CRMTemplate {
  id: string;
  name: string;
  body: string;
  header?: string;
  footer?: string;
  category?: string;
  language?: string;
  type?: string;
  variables?: string[];
  content?: CRMTemplateContent;
  buttons?: CRMTemplateButton[];
  mediaUrl?: string;
  createdAt: string;
}
