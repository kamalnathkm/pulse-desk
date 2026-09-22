import React, { useState } from 'react';
import { X, Code, ArrowDownToLine, AlertCircle } from 'lucide-react';
import { parseCurl } from '../services/curlParser';
import { ApiRequest } from '../types';

interface CurlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (parsed: Partial<ApiRequest>) => void;
}

export const CurlModal: React.FC<CurlModalProps> = ({ isOpen, onClose, onImport }) => {
  const [curlText, setCurlText] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImport = () => {
    if (!curlText.trim()) return;
    const parsed = parseCurl(curlText);
    if (!parsed || !parsed.url) {
      setError('Could not parse a valid URL from the cURL command. Ensure it starts with "curl" and includes a URL.');
      return;
    }
    setError(null);
    onImport(parsed);
    setCurlText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-900 border border-surface-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-surface-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-teal-400" />
            <span className="font-semibold text-sm text-white">Import from cURL</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <p className="text-xs text-slate-400">
            Paste any raw cURL command (from Chrome DevTools, API docs, or terminal):
          </p>

          <textarea
            rows={8}
            value={curlText}
            onChange={(e) => {
              setCurlText(e.target.value);
              if (error) setError(null);
            }}
            placeholder={`curl --request POST \\\n  --url 'https://api.example.com/items' \\\n  --header 'Content-Type: application/json' \\\n  --data '{"name":"Widget"}'`}
            className="w-full bg-surface-950 border border-surface-800 rounded-lg p-3 font-mono text-xs text-teal-300 focus:outline-none focus:border-brand-500/50 resize-none leading-relaxed"
          />

          {error && (
            <div className="p-2.5 bg-rose-950/20 border border-rose-800/40 rounded-lg text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-surface-800 flex justify-end gap-2 bg-surface-950/60">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!curlText.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-surface-950 font-semibold text-xs rounded-lg shadow-sm transition"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Import Request</span>
          </button>
        </div>
      </div>
    </div>
  );
};
