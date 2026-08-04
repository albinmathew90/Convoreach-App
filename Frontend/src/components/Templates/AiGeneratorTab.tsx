import { useState } from 'react';
import Label from '../form/Label';
import Button from '../ui/button/Button';

interface AiGeneratorTabProps {
  onGenerate: (data: any) => void;
}

export default function AiGeneratorTab({ onGenerate }: AiGeneratorTabProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [assistant, setAssistant] = useState('groq');
  const [prompt, setPrompt] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    try {
      const response = await fetch('/openwa-api/ai/templates/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, assistant })
      });

      if (!response.ok) {
        throw new Error('Failed to generate template');
      }

      const generatedContent = await response.json();

      const result = {
        category: 'Marketing',
        language: 'English',
        type: 'Text',
        content: {
          header: generatedContent.header || '',
          body: generatedContent.body || '',
          footer: generatedContent.footer || '',
          buttons: []
        }
      };

      onGenerate(result);
    } catch (error) {
      console.error(error);
      alert('Error generating template. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm space-y-6">
      <div>
          <Label>Select AI Assistant</Label>
          <div className="grid grid-cols-1 gap-3 mt-2">
            {[
              { id: 'groq', name: 'Groq', icon: '🚀' }
            ].map(ai => (
              <button
                key={ai.id}
                onClick={() => setAssistant(ai.id)}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${assistant === ai.id
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                    : 'border-gray-100 hover:border-brand-200 dark:border-gray-800 dark:hover:border-gray-700'
                  }`}
              >
                <span className="text-2xl">{ai.icon}</span>
                <span className={`text-xs font-semibold ${assistant === ai.id ? 'text-brand-700 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {ai.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>What should the template be about?</Label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Write a marketing message for our upcoming summer sale offering 30% off sunglasses. Make it sound exciting and include variables for the customer's first name."
            className="mt-2 w-full h-32 rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white placeholder:text-gray-400 resize-none"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full sm:w-auto min-w-[160px]"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                Generate Template
              </span>
            )}
          </Button>
        </div>
    </div>
  );
}
