import { useRef, useEffect, useState } from 'react';
import type { InboxConversation, InboxFilter } from '../types/inbox.types';
import ConversationCard from './ConversationCard';

const FILTERS: { key: InboxFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'replied', label: 'Replied' },
  { key: 'not_replied', label: 'Not Replied' },
];

interface Props {
  conversations: InboxConversation[];
  total: number;
  archivedCount?: number;
  loading: boolean;
  error: string | null;
  filter: InboxFilter;
  search: string;
  selectedId: string | null;
  sseConnected: boolean;
  onFilterChange: (f: InboxFilter) => void;
  onSearchChange: (s: string) => void;
  onSelectConversation: (id: string) => void;
  onAddContact?: () => void;
  isSelectMode: boolean;
  setIsSelectMode: (mode: boolean) => void;
  selectedIds: Set<string>;
  onToggleCheck: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onBulkDelete: () => void;
  onBulkArchive: () => void;
  onMarkAllRead: () => void;
}

export default function ConversationList({
  conversations,
  total,
  archivedCount = 0,
  loading,
  error,
  filter,
  search,
  selectedId,
  sseConnected,
  onFilterChange,
  onSearchChange,
  onSelectConversation,
  onAddContact,
  isSelectMode,
  setIsSelectMode,
  selectedIds,
  onToggleCheck,
  onSelectAll,
  onBulkDelete,
  onBulkArchive,
  onMarkAllRead,
}: Props) {
  const filterScrollRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // Scroll active filter tab into view
  useEffect(() => {
    const el = filterScrollRef.current?.querySelector('[data-active="true"]');
    el?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [filter]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Inbox</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {total > 0 ? `${total} conversation${total !== 1 ? 's' : ''}` : 'No conversations'}
              {' '}
              <span className={`inline-flex items-center gap-1 ${sseConnected ? 'text-success-500' : 'text-gray-300'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sseConnected ? 'bg-success-500' : 'bg-gray-300'}`} />
                {sseConnected ? 'live' : 'polling'}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-1.5" ref={menuRef}>
            {onAddContact && (
              <button
                onClick={onAddContact}
                title="Add New Contact"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Contact</span>
              </button>
            )}
            
            {/* Options Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center justify-center w-8 h-8 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                title="More options"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>
              
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-theme-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[99]">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={(e) => { 
                        e.stopPropagation();
                        setIsSelectMode(true); 
                        setTimeout(() => setMenuOpen(false), 50);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Select Chats
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { 
                        e.stopPropagation();
                        onMarkAllRead(); 
                        setTimeout(() => setMenuOpen(false), 50);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or number..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs — horizontal scroll or Archived Header */}
      {filter === 'archived' ? (
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <button
            onClick={() => onFilterChange('all')}
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Chats
          </button>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">📦 Archived ({total})</span>
        </div>
      ) : (
        <div
          ref={filterScrollRef}
          className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar border-b border-gray-100 dark:border-gray-800 flex-shrink-0"
        >
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              data-active={filter === key}
              onClick={() => onFilterChange(key)}
              className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap
                ${filter === key
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Bulk Actions Toolbar */}
      {isSelectMode && conversations.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 flex-shrink-0 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setIsSelectMode(false); onSelectAll(false); }}
              title="Cancel Selection"
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-1 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox"
                className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-brand-600 focus:ring-brand-500 cursor-pointer transition-colors"
                checked={conversations.length > 0 && selectedIds.size === conversations.length}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
              <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                Select All
              </span>
            </label>
          </div>
          
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-1.5 animate-in fade-in zoom-in duration-150">
              <span className="text-[10px] text-gray-500 font-medium mr-1 bg-white dark:bg-gray-900 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                {selectedIds.size} selected
              </span>
              <button
                onClick={onBulkArchive}
                title={filter === 'archived' ? 'Unarchive Selected' : 'Archive Selected'}
                className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors border border-transparent hover:border-brand-200 dark:hover:border-brand-500/20 shadow-sm hover:shadow"
              >
                {filter === 'archived' ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-6M9 13l3-3 3 3" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12v6M9 15l3 3 3 3" />
                  </svg>
                )}
              </button>
              <button
                onClick={onBulkDelete}
                title="Delete Selected"
                className="p-1.5 text-gray-500 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-500/10 rounded-lg transition-colors border border-transparent hover:border-error-200 dark:hover:border-error-500/20 shadow-sm hover:shadow"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filter !== 'archived' && archivedCount > 0 && !loading && !search && (
          <div
            onClick={() => onFilterChange('archived')}
            className="flex items-center justify-between px-4 py-3 bg-gray-50/70 hover:bg-gray-100 dark:bg-gray-800/40 dark:hover:bg-gray-800/70 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Archived</span>
            </div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-200/80 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              {archivedCount}
            </span>
          </div>
        )}

        {loading && conversations.length === 0 ? (
          <ConversationListSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <svg className="w-10 h-10 text-error-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Failed to load</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{error}</p>
          </div>
        ) : conversations.length === 0 ? (
          <EmptyState filter={filter} search={search} />
        ) : (
          conversations.map((conv) => (
            <ConversationCard
              key={conv.id}
              conversation={conv}
              isSelected={conv.id === selectedId}
              onClick={() => onSelectConversation(conv.id)}
              isChecked={selectedIds.has(conv.id)}
              onToggleCheck={isSelectMode ? (checked, e) => {
                e.stopPropagation();
                onToggleCheck(conv.id, checked);
              } : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ConversationListSkeleton() {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="px-4 py-3 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between mb-1.5">
                <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-2/5" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-8" />
              </div>
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4 mb-1" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ search }: { filter?: InboxFilter; search: string }) {
  if (search) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No results found</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">No contacts match "{search}"</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="relative mb-4">
        {/* Main green bubble */}
        <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-sm relative">
          <svg className="w-7 h-7 text-white mt-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.029 2 11c0 2.87 1.488 5.432 3.82 7.081.258 1.417-.66 3.011-.7 3.078a.498.498 0 00.548.718c2.812-.516 4.672-1.895 5.253-2.355A10.82 10.82 0 0012 20c5.523 0 10-4.029 10-9s-4.477-9-10-9z" />
          </svg>
          <div className="absolute flex gap-0.5 items-center justify-center -translate-y-1">
            <div className="w-1 h-1 rounded-full bg-white/70"></div>
            <div className="w-1 h-1 rounded-full bg-white/70"></div>
            <div className="w-1 h-1 rounded-full bg-white/70"></div>
          </div>
        </div>
        {/* Red X badge */}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-white dark:border-gray-950 flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
        No chats available at the moment
      </p>
    </div>
  );
}
