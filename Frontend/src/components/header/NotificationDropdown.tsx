import { useState, useEffect, useCallback } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { Link } from "react-router";
import { io, Socket } from "socket.io-client";

interface NotificationMsg {
  id: string;
  chatName?: string;
  from: string;
  body: string;
  type: string;
  timestamp: number;
  metadata?: any;
  contact?: {
    name?: string;
    pushName?: string;
    shortName?: string;
  };
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationMsg[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const fetchRecentNotifications = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('crm_token');
      const res = await fetch('/openwa-api/crm/sessions/notifications/recent', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data: NotificationMsg[] = await res.json();
        const dismissed = JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');
        const filteredData = data.filter(msg => !dismissed.includes(msg.id));
        setNotifications(filteredData);
        // By default, initially fetched are treated as "read" or we can just show badge if any
        setUnreadCount(filteredData.length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  }, []);

  useEffect(() => {
    fetchRecentNotifications();

    const token = sessionStorage.getItem('crm_token');
    if (!token) return;

    // Use window.location.host since the proxy forwards WS traffic or we can just let socket.io figure out the path
    const socket: Socket = io('/crm-events', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => console.log('CRM WS Connected successfully to /crm-events'));
    
    socket.on('notification.received', (msg: NotificationMsg) => {
      console.log('CRM WS notification.received:', msg);
      // 24 hours check - only add if within 24 hours (though new ones are always within 24h)
      setNotifications(prev => {
        // Prevent duplicates just in case
        if (prev.find(p => p.id === msg.id)) return prev;
        return [msg, ...prev].slice(0, 50); // Keep max 50 in memory
      });
      setUnreadCount(prev => prev + 1);

      // Show browser notification if permitted and window is not focused
      if (Notification.permission === 'granted' && !document.hasFocus()) {
        const title = msg.chatName || msg.contact?.name || msg.contact?.pushName || (msg.metadata as any)?.senderPhone || (msg.from ? msg.from.split('@')[0] : 'New Message');
        const bodyText = msg.body || `[${msg.type.toUpperCase()}]`;
        new Notification(title, { body: bodyText });
      }
    });

    socket.on('connect_error', (err) => console.error('CRM WS Connection Error:', err));
    socket.on('disconnect', (reason) => console.log('CRM WS Disconnected:', reason));

    // Request notification permission if not already granted or denied
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      socket.disconnect();
    };
  }, [fetchRecentNotifications]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0); // clear badge when opened
      setShowAll(false); // Reset to 5 items when opened
    }
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setShowAll(false);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-gray-200"
      >
        <span
          className={`absolute -right-1 -top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-error-500 text-[10px] font-bold text-white shadow-sm ${
            unreadCount > 0 ? "flex" : "hidden"
          }`}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.0003 2.5C7.29177 2.5 5.08366 4.67389 5.08366 7.375V9.45781C5.08366 10.4284 4.70884 11.3614 4.0396 12.062L3.89679 12.2117C3.60627 12.5161 3.52044 12.9567 3.67606 13.3444C3.83167 13.7321 4.20019 13.9844 4.61803 13.9844H15.3826C15.8005 13.9844 16.169 13.7321 16.3246 13.3444C16.4802 12.9567 16.3944 12.5161 16.1039 12.2117L15.9611 12.062C15.2918 11.3614 14.917 10.4284 14.917 9.45781V7.375C14.917 4.67389 12.7089 2.5 10.0003 2.5ZM3.58366 7.375C3.58366 3.84568 6.4563 0.984375 10.0003 0.984375C13.5443 0.984375 16.417 3.84568 16.417 7.375V9.45781C16.417 10.0132 16.6312 10.5463 17.0137 10.9469L17.1565 11.0966C17.9621 11.9405 18.2001 13.1613 17.7686 14.2372C17.3372 15.313 16.3155 16 15.1582 16H11.5176C11.5369 16.1554 11.547 16.3142 11.547 16.4752C11.547 17.3366 11.2016 18.1627 10.587 18.7719C9.97233 19.3811 9.13867 19.7233 8.26938 19.7233C7.40009 19.7233 6.56643 19.3811 5.95179 18.7719C5.33714 18.1627 4.99182 17.3366 4.99182 16.4752C4.99182 16.3142 5.00194 16.1554 5.02123 16H4.84247C3.68512 16 2.66347 15.313 2.232 14.2372C1.80053 13.1613 2.03855 11.9405 2.84414 11.0966L2.98695 10.9469C3.36948 10.5463 3.58366 10.0132 3.58366 9.45781V7.375ZM10.047 16H6.52973C6.54133 16.1542 6.54734 16.3137 6.54734 16.4752C6.54734 16.9287 6.72918 17.3637 7.05315 17.6844C7.37711 18.0051 7.8165 18.1852 8.27464 18.1852C8.73278 18.1852 9.17216 18.0051 9.49613 17.6844C9.82009 17.3637 10.0019 16.9287 10.0019 16.4752C10.0019 16.3137 10.0177 16.1542 10.047 16Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notification
          </h5>
          <div className="flex items-center gap-3">
            {notifications.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const dismissed = JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');
                  const newDismissed = [...dismissed, ...notifications.map(n => n.id)];
                  localStorage.setItem('dismissed_notifications', JSON.stringify(newDismissed));
                  setNotifications([]);
                  setUnreadCount(0);
                }}
                className="text-xs font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={toggleDropdown}
              className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <svg
                className="fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <li className="p-4 text-sm text-center text-gray-500 dark:text-gray-400">
              No new notifications
            </li>
          ) : (
            notifications.slice(0, showAll ? undefined : 5).map((msg) => {
              const isReply = !!(msg.metadata as any)?.quotedMessage;
              return (
                <li key={msg.id} className="group relative p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors last:border-0">
                  <div className="flex flex-col gap-1 pr-6">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate pr-2">
                        {msg.chatName || msg.contact?.name || msg.contact?.pushName || (msg.metadata as any)?.senderPhone || (msg.from ? msg.from.split('@')[0] : 'Unknown')}
                      </span>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {new Date(msg.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      <span className="text-brand-500 font-medium">{isReply ? 'Replied: ' : 'Messaged: '}</span> 
                      {msg.body || `[${msg.type.toUpperCase()}]`}
                    </p>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setNotifications(prev => prev.filter(n => n.id !== msg.id));
                      // Optional: save dismissed IDs to localStorage so they don't reappear on reload
                      const dismissed = JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');
                      if (!dismissed.includes(msg.id)) {
                        localStorage.setItem('dismissed_notifications', JSON.stringify([...dismissed, msg.id]));
                      }
                      setUnreadCount(prev => Math.max(0, prev - 1));
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    title="Remove notification"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              );
            })
          )}
        </ul>
        
        {!showAll && notifications.length > 5 && (
          <button
            onClick={() => setShowAll(true)}
            className="block w-full px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
          >
            View All Notifications
          </button>
        )}
      </Dropdown>
    </div>
  );
}
