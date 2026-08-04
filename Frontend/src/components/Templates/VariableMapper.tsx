import { useMemo } from 'react';

interface VariableMapping {
  [key: string]: string;
}

interface VariableMapperProps {
  textContexts: (string | undefined)[];
  mappings: VariableMapping;
  onMappingChange: (variable: string, column: string) => void;
}

// Will be fetched from backend

import { useState, useEffect } from 'react';

export default function VariableMapper({ textContexts, mappings, onMappingChange }: VariableMapperProps) {
  const [columns, setColumns] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const token = sessionStorage.getItem('crm_token');
        const res = await fetch('/openwa-api/crm/contacts/columns', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('fetchColumns response:', res.status, res.statusText);
        if (res.ok) {
          const data = await res.json();
          console.log('fetchColumns data:', data);
          setColumns(data);
        } else {
          console.error('fetchColumns failed with text:', await res.text());
        }
      } catch (e) {
        console.error('Failed to load columns', e);
      }
    };
    fetchColumns();
  }, []);
  // Extract unique variables from all text sources
  const variables = useMemo(() => {
    const combinedText = textContexts.filter(Boolean).join(' ');
    const regex = /\{\{(.*?)\}\}/g;
    const matches = combinedText.match(regex) || [];
    
    // Clean and deduplicate (e.g. "{{1}}" -> "1")
    const uniqueVars = Array.from(new Set(matches.map(m => m.replace(/[{}]/g, ''))));
    return uniqueVars;
  }, [textContexts]);

  if (variables.length === 0) return null;

  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-900/30 dark:bg-brand-500/5">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-brand-800 dark:text-brand-400 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Dynamic Variables Detected
        </h4>
        <p className="text-xs text-brand-600/80 dark:text-brand-400/80 mt-1">
          Map these template variables to your database columns. This will be automatically applied when you send a broadcast.
        </p>
      </div>

      <div className="space-y-4">
        {variables.map((variable) => (
          <div key={variable} className="flex items-center gap-4">
            <div className="w-32 shrink-0">
              <span className="inline-block px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-700 dark:text-gray-300 font-medium">
                {`{{${variable}}}`}
              </span>
            </div>
            <div className="text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <div className="flex-1 relative">
              <select
                value={mappings[variable] || ''}
                onChange={(e) => onMappingChange(variable, e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white"
              >
                <option value="" disabled>Select database column...</option>
                {columns.map(col => (
                  <option key={col.id} value={col.id}>{col.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
