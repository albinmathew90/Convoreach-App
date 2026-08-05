import { useState, useEffect, useCallback, useRef } from 'react';
import type { InboxMessage, InboxConversation, SendReplyPayload, InboxSSEEvent } from '../types/inbox.types';
import * as api from '../services/inbox.api';

const PAGE_SIZE = 40;

export function useConversation(
  sessionId: string | null,
  conversation: InboxConversation | null,
  onConversationUpdate?: (patch: Partial<InboxConversation>) => void,
) {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // ─── Load initial messages ───────────────────────────────────────────

  const loadMessages = useCallback(async () => {
    if (!sessionId || !conversation) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMessages(sessionId, conversation.id, { limit: PAGE_SIZE });
      setMessages(data.messages);
      setTotal(data.total);
      setHasMore(data.total > PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [sessionId, conversation?.id]); // eslint-disable-line

  // ─── Load older messages (infinite scroll up) ────────────────────────

  const loadMore = useCallback(async () => {
    if (!sessionId || !conversation || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const data = await api.getMessages(sessionId, conversation.id, {
        limit: PAGE_SIZE,
        offset: messages.length,
      });
      setMessages((prev) => [...data.messages, ...prev]);
      setHasMore(messages.length + data.messages.length < data.total);
    } catch {
      // Silent failure on older message load
    } finally {
      setLoadingMore(false);
    }
  }, [sessionId, conversation?.id, loadingMore, hasMore, messages.length]); // eslint-disable-line

  // ─── Handle incoming SSE message ─────────────────────────────────────

  const handleSSEMessage = useCallback(
    (event: InboxSSEEvent) => {
      if (!conversation) return;
      if (event.conversationId !== conversation.id) return;

      if (event.type === 'message_received' || event.type === 'message_sent') {
        const payload = event.data as { message?: InboxMessage; conversation?: Partial<InboxConversation> };
        if (payload.message) {
          setMessages((prev) => {
            // Deduplicate
            const exists = prev.find((m) => m.id === payload.message!.id);
            if (exists) return prev;
            return [...prev, payload.message!];
          });
          setTotal((t) => t + 1);
        }
        if (payload.conversation && onConversationUpdate) {
          onConversationUpdate(payload.conversation as Partial<InboxConversation>);
        }
      } else if (event.type === 'conversation_updated') {
        const payload = event.data as { messageId?: string; status?: string; deletedMessageIds?: string[] };
        
        // Status tick update for outgoing messages
        if (payload.messageId && payload.status) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === payload.messageId
                ? { ...m, status: payload.status as InboxMessage['status'] }
                : m,
            ),
          );
        }
        
        // Delete messages from state
        if (payload.deletedMessageIds && Array.isArray(payload.deletedMessageIds)) {
          setMessages((prev) => prev.filter((m) => !payload.deletedMessageIds!.includes(m.id)));
        }
      }
    },
    [conversation?.id, onConversationUpdate], // eslint-disable-line
  );

  // ─── Send reply ───────────────────────────────────────────────────────

  const sendReply = useCallback(
    async (payload: SendReplyPayload): Promise<boolean> => {
      if (!sessionId || !conversation) return false;
      setSending(true);

      // Optimistic message
      const optimisticId = `opt-${Date.now()}`;
      const optimistic: InboxMessage = {
        id: optimisticId,
        conversationId: conversation.id,
        waMessageId: null,
        sessionId,
        direction: 'outgoing',
        type: payload.type as InboxMessage['type'],
        body: payload.text ?? null,
        caption: null,
        mediaUrl: null,
        mediaName: null,
        mediaMimeType: null,
        mediaSize: null,
        mediaDuration: null,
        quotedMessageId: payload.quotedMessageId ?? null,
        quotedBody: payload.quotedBody ?? null,
        timestamp: Math.floor(Date.now() / 1000),
        status: 'pending',
        metadata: null,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      };

      setMessages((prev) => [...prev, optimistic]);

      try {
        const confirmed = await api.sendReply(sessionId, conversation.id, payload);
        // Replace optimistic with confirmed
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticId ? { ...confirmed, isOptimistic: false } : m)),
        );
        // Update conversation preview locally
        if (onConversationUpdate) {
          onConversationUpdate({
            lastMessageBody: payload.text ?? `[${payload.type}]`,
            lastMessageDirection: 'outgoing',
            lastMessageAt: new Date().toISOString(),
            status: 'replied',
          });
        }
        return true;
      } catch (err) {
        // Mark as failed
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticId ? { ...m, status: 'failed' as const } : m,
          ),
        );
        setError(err instanceof Error ? err.message : 'Failed to send message');
        return false;
      } finally {
        setSending(false);
      }
    },
    [sessionId, conversation, onConversationUpdate],
  );

  // ─── Auto-scroll to bottom ────────────────────────────────────────────

  const scrollToBottom = useCallback((smooth = false) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  // ─── Effects ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (conversation) {
      setMessages([]);
      setTotal(0);
      setHasMore(false);
      loadMessages();
    }
  }, [conversation?.id]); // eslint-disable-line

  useEffect(() => {
    if (!loading && messages.length > 0) {
      // Scroll to bottom on initial load
      setTimeout(() => scrollToBottom(false), 50);
    }
  }, [loading]); // eslint-disable-line

  // Scroll to bottom when new messages arrive (only if near bottom)
  const prevCount = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevCount.current) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.direction === 'outgoing' || isNearBottom(containerRef.current)) {
        setTimeout(() => scrollToBottom(true), 50);
      }
    }
    prevCount.current = messages.length;
  }, [messages.length]); // eslint-disable-line

  return {
    messages,
    total,
    loading,
    loadingMore,
    sending,
    error,
    hasMore,
    bottomRef,
    containerRef,
    loadMore,
    sendReply,
    scrollToBottom,
    handleSSEMessage,
  };
}

function isNearBottom(container: HTMLElement | null, threshold = 120): boolean {
  if (!container) return true;
  const { scrollTop, scrollHeight, clientHeight } = container;
  return scrollHeight - scrollTop - clientHeight < threshold;
}
