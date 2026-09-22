import React, { useState } from 'react';
import { Copy, Check, Clock, Database, AlertCircle, ShieldAlert, Sparkles, Terminal } from 'lucide-react';
import { ApiResponse } from '../types';

interface ResponseViewerProps {
  response: ApiResponse | null;
  isLoading: boolean;
}

export const ResponseViewer: React.FC<ResponseViewerProps> = ({ response, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'raw' | 'headers'>('preview');
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface-950 text-slate-400">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-mono text-slate-300">Executing request over network...</span>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface-950 text-slate-500 select-none">
        <div className="w-12 h-12 rounded-2xl bg-surface-900 border border-surface-800 flex items-center justify-center mb-3">
          <Terminal className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-300">Ready to Send</p>
        <p className="text-xs text-slate-500 max-w-sm text-center mt-1">
          Select or enter an endpoint URL and hit <span className="font-mono text-teal-400">Send</span> or press <kbd className="px-1 py-0.5 bg-surface-800 border border-surface-700 rounded text-[10px] text-slate-300">Ctrl+Enter</kbd>.
        </p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(response.data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
    if (status >= 300 && status < 400) {
      return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    }
    if (status >= 400 && status < 500) {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
    if (status >= 500) {
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
    return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-950 overflow-hidden">
      {/* Response Metrics Header */}
      <div className="p-3 border-b border-surface-800 flex flex-wrap items-center justify-between gap-3 bg-surface-900/50">
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${getStatusBadge(
              response.status
            )}`}
          >
            {response.status > 0 ? (
              <>
                <span>{response.status}</span>
                <span>{response.statusText}</span>
              </>
            ) : (
              <span>Network Failure</span>
            )}
          </div>

          {/* Latency */}
          <div className="flex items-center gap-1 text-xs font-mono text-slate-400">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>{response.duration} ms</span>
          </div>

          {/* Size */}
          <div className="flex items-center gap-1 text-xs font-mono text-slate-400">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>{formatSize(response.size)}</span>
          </div>
        </div>

        {/* Copy Button */}
        {response.data && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-surface-800 hover:bg-surface-700 border border-surface-700 px-2.5 py-1 rounded-lg transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center px-4 border-b border-surface-800 gap-4 text-xs font-medium bg-surface-900/30">
        <button
          onClick={() => setActiveTab('preview')}
          className={`py-2 border-b-2 transition ${
            activeTab === 'preview'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Response Body
        </button>

        <button
          onClick={() => setActiveTab('headers')}
          className={`py-2 border-b-2 transition ${
            activeTab === 'headers'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Headers ({Object.keys(response.headers).length})
        </button>

        <button
          onClick={() => setActiveTab('raw')}
          className={`py-2 border-b-2 transition ${
            activeTab === 'raw'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Raw String
        </button>
      </div>

      {/* Body / Content Area */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
        {response.error ? (
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 text-rose-300 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-rose-400 text-sm">
              <ShieldAlert className="w-4 h-4" />
              <span>Request Execution Error</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300 font-sans">{response.error}</p>
            <div className="p-3 bg-surface-900/80 rounded-lg border border-surface-800 text-[11px] text-slate-400 space-y-1 font-sans">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Cross-Platform Tip:</span>
              </div>
              <div>
                Web browsers enforce strict Cross-Origin Resource Sharing (CORS) rules on third-party APIs. Launching PulseDesk with <span className="font-mono text-teal-400">npm run electron</span> bypasses all CORS restrictions natively!
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'preview' && (
              <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {response.data || '(Empty response payload)'}
              </pre>
            )}

            {activeTab === 'raw' && (
              <pre className="text-slate-400 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {response.data}
              </pre>
            )}

            {activeTab === 'headers' && (
              <div className="border border-surface-800 rounded-lg overflow-hidden divide-y divide-surface-800">
                {Object.keys(response.headers).length === 0 ? (
                  <div className="p-4 text-center text-slate-500 font-sans">No response headers captured.</div>
                ) : (
                  Object.entries(response.headers).map(([key, val]) => (
                    <div key={key} className="flex p-2 hover:bg-surface-900/50 text-[11px]">
                      <span className="w-1/3 text-brand-400 font-semibold truncate pr-2">{key}</span>
                      <span className="w-2/3 text-slate-300 break-all">{val}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
