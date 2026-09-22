import React, { useState, useEffect } from 'react';
import {
  Send,
  Save,
  Plus,
  Trash2,
  Copy,
  Check,
  Code2,
  Sliders,
  FileText,
  Bookmark
} from 'lucide-react';
import { ApiRequest, HttpMethod, KeyValuePair, BodyType, Collection, Environment } from '../types';
import { generateCurl } from '../services/curlParser';
import { substituteVariables, buildFullUrl } from '../services/environment';

interface RequestEditorProps {
  request: ApiRequest;
  collections: Collection[];
  activeEnvironment?: Environment | null;
  isLoading: boolean;
  onChange: (updated: ApiRequest) => void;
  onSend: () => void;
  onSave: (collectionId?: string) => void;
}

export const RequestEditor: React.FC<RequestEditorProps> = ({
  request,
  collections,
  activeEnvironment,
  isLoading,
  onChange,
  onSend,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'curl'>('params');
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(
    request.collectionId || collections[0]?.id || ''
  );

  // Global hotkey: Ctrl+Enter / Cmd+Enter to send request
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isLoading) {
          onSend();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, onSend]);

  const updateField = <K extends keyof ApiRequest>(key: K, value: ApiRequest[K]) => {
    onChange({ ...request, [key]: value });
  };

  // Param table helpers
  const handleAddParam = () => {
    const newParam: KeyValuePair = {
      id: Math.random().toString(36).substring(2, 9),
      key: '',
      value: '',
      enabled: true
    };
    updateField('params', [...request.params, newParam]);
  };

  const handleUpdateParam = (id: string, updates: Partial<KeyValuePair>) => {
    const updated = request.params.map((p) => (p.id === id ? { ...p, ...updates } : p));
    updateField('params', updated);
  };

  const handleDeleteParam = (id: string) => {
    updateField('params', request.params.filter((p) => p.id !== id));
  };

  // Header table helpers
  const handleAddHeader = () => {
    const newHeader: KeyValuePair = {
      id: Math.random().toString(36).substring(2, 9),
      key: '',
      value: '',
      enabled: true
    };
    updateField('headers', [...request.headers, newHeader]);
  };

  const handleUpdateHeader = (id: string, updates: Partial<KeyValuePair>) => {
    const updated = request.headers.map((h) => (h.id === id ? { ...h, ...updates } : h));
    updateField('headers', updated);
  };

  const handleDeleteHeader = (id: string) => {
    updateField('headers', request.headers.filter((h) => h.id !== id));
  };

  const handleFormatJsonBody = () => {
    try {
      const parsed = JSON.parse(request.bodyContent);
      updateField('bodyContent', JSON.stringify(parsed, null, 2));
    } catch {
      // Ignore if invalid JSON
    }
  };

  const fullUrl = buildFullUrl(
    substituteVariables(request.url, activeEnvironment),
    request.params
  );
  const curlCode = generateCurl(request, fullUrl);

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCode);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-surface-900 overflow-hidden border-b md:border-b-0 md:border-r border-surface-800">
      {/* Request Header Bar (Name & Save) */}
      <div className="p-3 border-b border-surface-800 flex items-center justify-between gap-3">
        <input
          type="text"
          value={request.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Request Name..."
          className="bg-transparent font-medium text-sm text-slate-100 hover:bg-surface-800/50 px-2 py-1 rounded transition focus:bg-surface-800 focus:outline-none flex-1"
        />

        <div className="flex items-center gap-2">
          {collections.length > 0 && (
            <select
              value={selectedCollectionId}
              onChange={(e) => setSelectedCollectionId(e.target.value)}
              className="bg-surface-800 border border-surface-700 text-xs text-slate-300 py-1 px-2 rounded-lg focus:outline-none"
            >
              {collections.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => onSave(selectedCollectionId)}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-surface-800 hover:bg-surface-700 border border-surface-700 px-2.5 py-1.5 rounded-lg transition"
            title="Save Request into Collection"
          >
            <Bookmark className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </div>

      {/* URL & Method Bar */}
      <div className="p-3 border-b border-surface-800 flex items-center gap-2">
        <div className="flex-1 flex items-center rounded-lg bg-surface-950 border border-surface-700 focus-within:border-brand-500 transition">
          {/* Method selector */}
          <select
            value={request.method}
            onChange={(e) => updateField('method', e.target.value as HttpMethod)}
            className="bg-surface-800 text-xs font-mono font-bold text-white px-3 py-2 rounded-l-lg border-r border-surface-700 focus:outline-none cursor-pointer"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
            <option value="HEAD">HEAD</option>
            <option value="OPTIONS">OPTIONS</option>
          </select>

          {/* URL Input */}
          <input
            type="text"
            value={request.url}
            onChange={(e) => updateField('url', e.target.value)}
            placeholder="Enter request URL (e.g. {{baseUrl}}/posts or https://api.example.com)..."
            className="w-full bg-transparent px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={onSend}
          disabled={isLoading || !request.url.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-brand-600 hover:from-teal-400 hover:to-brand-500 disabled:opacity-50 text-surface-950 font-semibold text-xs rounded-lg shadow-md shadow-teal-500/10 transition"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-surface-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5 fill-current" />
          )}
          <span>Send</span>
          <span className="hidden lg:inline text-[10px] text-teal-950/70 font-mono">Ctrl+Enter</span>
        </button>
      </div>

      {/* Request Config Tabs */}
      <div className="flex items-center px-4 border-b border-surface-800 gap-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab('params')}
          className={`py-2.5 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'params'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Params ({request.params.filter((p) => p.enabled && p.key).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('headers')}
          className={`py-2.5 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'headers'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Headers ({request.headers.filter((h) => h.enabled && h.key).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('body')}
          className={`py-2.5 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'body'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Body</span>
          {request.bodyType !== 'none' && (
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('curl')}
          className={`py-2.5 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'curl'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>cURL</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* PARAMS TAB */}
        {activeTab === 'params' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Query Parameters</span>
              <button
                onClick={handleAddParam}
                className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Add Param
              </button>
            </div>

            {request.params.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 border border-dashed border-surface-800 rounded-lg">
                No query parameters added yet. Click &quot;Add Param&quot; above.
              </div>
            ) : (
              <div className="border border-surface-800 rounded-lg overflow-hidden divide-y divide-surface-800">
                {request.params.map((param) => (
                  <div key={param.id} className="flex items-center gap-2 p-2 bg-surface-950/60 text-xs">
                    <input
                      type="checkbox"
                      checked={param.enabled}
                      onChange={(e) => handleUpdateParam(param.id, { enabled: e.target.checked })}
                      className="rounded bg-surface-800 border-surface-700 text-brand-500 focus:ring-0"
                    />
                    <input
                      type="text"
                      placeholder="Key"
                      value={param.key}
                      onChange={(e) => handleUpdateParam(param.id, { key: e.target.value })}
                      className="flex-1 bg-surface-900 border border-surface-800 rounded px-2 py-1 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-brand-500/50"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={param.value}
                      onChange={(e) => handleUpdateParam(param.id, { value: e.target.value })}
                      className="flex-1 bg-surface-900 border border-surface-800 rounded px-2 py-1 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-brand-500/50"
                    />
                    <button
                      onClick={() => handleDeleteParam(param.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HEADERS TAB */}
        {activeTab === 'headers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">HTTP Headers</span>
              <button
                onClick={handleAddHeader}
                className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Add Header
              </button>
            </div>

            {request.headers.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 border border-dashed border-surface-800 rounded-lg">
                No custom headers added yet. Click &quot;Add Header&quot; above.
              </div>
            ) : (
              <div className="border border-surface-800 rounded-lg overflow-hidden divide-y divide-surface-800">
                {request.headers.map((header) => (
                  <div key={header.id} className="flex items-center gap-2 p-2 bg-surface-950/60 text-xs">
                    <input
                      type="checkbox"
                      checked={header.enabled}
                      onChange={(e) => handleUpdateHeader(header.id, { enabled: e.target.checked })}
                      className="rounded bg-surface-800 border-surface-700 text-brand-500 focus:ring-0"
                    />
                    <input
                      type="text"
                      placeholder="Header Name (e.g. Authorization)"
                      value={header.key}
                      onChange={(e) => handleUpdateHeader(header.id, { key: e.target.value })}
                      className="flex-1 bg-surface-900 border border-surface-800 rounded px-2 py-1 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-brand-500/50"
                    />
                    <input
                      type="text"
                      placeholder="Header Value (e.g. Bearer token)"
                      value={header.value}
                      onChange={(e) => handleUpdateHeader(header.id, { value: e.target.value })}
                      className="flex-1 bg-surface-900 border border-surface-800 rounded px-2 py-1 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-brand-500/50"
                    />
                    <button
                      onClick={() => handleDeleteHeader(header.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BODY TAB */}
        {activeTab === 'body' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(['none', 'json', 'raw'] as BodyType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => updateField('bodyType', type)}
                    className={`px-2.5 py-1 text-xs rounded capitalize transition ${
                      request.bodyType === type
                        ? 'bg-brand-500/20 text-brand-300 font-medium border border-brand-500/40'
                        : 'bg-surface-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {request.bodyType === 'json' && (
                <button
                  onClick={handleFormatJsonBody}
                  className="text-xs text-teal-400 hover:text-teal-300 font-medium"
                >
                  Beautify JSON
                </button>
              )}
            </div>

            {request.bodyType === 'none' ? (
              <div className="text-center py-10 text-xs text-slate-500">
                This request does not include a body payload.
              </div>
            ) : (
              <textarea
                value={request.bodyContent}
                onChange={(e) => updateField('bodyContent', e.target.value)}
                placeholder="Enter request body here..."
                rows={12}
                className="w-full bg-surface-950 font-mono text-xs text-slate-200 p-3 rounded-lg border border-surface-800 focus:outline-none focus:border-brand-500/50 resize-y leading-relaxed"
              />
            )}
          </div>
        )}

        {/* CURL TAB */}
        {activeTab === 'curl' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Exportable cURL Command</span>
              <button
                onClick={handleCopyCurl}
                className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 bg-surface-800 px-2.5 py-1 rounded transition"
              >
                {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCurl ? 'Copied!' : 'Copy cURL'}</span>
              </button>
            </div>
            <pre className="p-3 bg-surface-950 rounded-lg border border-surface-800 font-mono text-[11px] text-teal-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {curlCode}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
