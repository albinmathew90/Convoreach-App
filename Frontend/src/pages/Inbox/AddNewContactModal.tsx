import { useState, useRef, useEffect } from 'react';
import * as api from './services/inbox.api';
import type { InboxConversation } from './types/inbox.types';

interface Props {
  sessionId: string;
  onClose: () => void;
  onSuccess: (conversation: InboxConversation) => void;
}

const COUNTRY_CODES = [
  { code: '+91', label: '🇮🇳 +91' },
  { code: '+1', label: '🇺🇸 +1' },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+61', label: '🇦🇺 +61' },
  { code: '+81', label: '🇯🇵 +81' },
  { code: '+971', label: '🇦🇪 +971' },
  { code: '+65', label: '🇸🇬 +65' },
];

export default function AddNewContactModal({ sessionId, onClose, onSuccess }: Props) {
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = async () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) return;

    const fullPhone = `${countryCode.replace('+', '')}${cleanPhone}`;
    const chatId = `${fullPhone}@c.us`; // Standard WhatsApp standard ID

    setLoading(true);
    setError(null);
    try {
      const conv = await api.createConversation(sessionId, {
        chatId,
        contactPhone: `+${fullPhone}`,
        contactName: name.trim() || undefined,
        // Optional fields are omitted, creating a generic non-campaign conversation
      });
      onSuccess(conv);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start conversation');
      setLoading(false);
    }
  };

  const isFormValid = phone.replace(/\D/g, '').length >= 7;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div 
        ref={modalRef}
        className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-theme-xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add New Contact</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Phone Input */}
          <div className="mb-5">
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-colors">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="pl-4 pr-8 py-3 bg-gray-50 dark:bg-gray-800 border-none text-gray-900 dark:text-white text-sm font-medium focus:ring-0 cursor-pointer appearance-none outline-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d\s-]/g, ''))}
                placeholder="Enter mobile number"
                className="flex-1 px-4 py-3 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-0 text-sm"
                autoFocus
              />
            </div>
            <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              Enter the contact number along with the correct country code (e.g., +1, +44, +91, +61, +81).
            </p>
          </div>

          {/* Name Input */}
          <div className="mb-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
              Name (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full pl-10 pr-4 py-3 bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-sm transition-colors"
              />
            </div>
            <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
              Provide a name for easy identification of the contact (optional).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
              ${isFormValid && !loading
                ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            )}
            Start Conversation
          </button>
        </div>
      </div>
    </div>
  );
}
