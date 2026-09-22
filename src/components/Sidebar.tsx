import React, { useState } from 'react';
import {
  Folder,
  ChevronRight,
  ChevronDown,
  Clock,
  Wrench,
  Search,
  Plus,
  Trash2,
  FolderPlus,
  X
} from 'lucide-react';
import { Collection, HistoryItem, ApiRequest, HttpMethod } from '../types';

interface SidebarProps {
  collections: Collection[];
  history: HistoryItem[];
  activeRequestId?: string;
  onSelectRequest: (request: ApiRequest) => void;
  onSelectHistoryItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
  onCreateCollection: (name: string) => void;
  onDeleteCollection: (id: string) => void;
  onDeleteRequestFromCollection: (collectionId: string, requestId: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  activeView: 'workbench' | 'devtools';
  onSwitchView: (view: 'workbench' | 'devtools') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collections,
  history,
  activeRequestId,
  onSelectRequest,
  onSelectHistoryItem,
  onClearHistory,
  onCreateCollection,
  onDeleteCollection,
  onDeleteRequestFromCollection,
  isMobileOpen,
  onCloseMobile,
  activeView,
  onSwitchView
}) => {
  const [activeTab, setActiveTab] = useState<'collections' | 'history'>('collections');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCollections, setExpandedCollections] = useState<Record<string, boolean>>({
    'col-jsonplaceholder': true,
    'col-httpbin': true
  });
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isAddingCollection, setIsAddingCollection] = useState(false);

  const toggleCollection = (id: string) => {
    setExpandedCollections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getMethodColor = (method: HttpMethod) => {
    switch (method) {
      case 'GET':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'POST':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'PUT':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      case 'PATCH':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'DELETE':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-emerald-400';
    if (status >= 400 && status < 500) return 'text-amber-400';
    if (status >= 500) return 'text-rose-400';
    return 'text-slate-400';
  };

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollectionName.trim()) {
      onCreateCollection(newCollectionName.trim());
      setNewCollectionName('');
      setIsAddingCollection(false);
    }
  };

  // Filter collections
  const filteredCollections = collections.map((col) => ({
    ...col,
    requests: col.requests.filter(
      (r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.method.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }));

  // Filter history
  const filteredHistory = history.filter(
    (h) =>
      h.request.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.request.method.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-72 bg-surface-900 border-r border-surface-800 flex flex-col z-40 transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Close Button */}
        <div className="flex md:hidden items-center justify-between p-3 border-b border-surface-800">
          <span className="font-semibold text-sm text-slate-200">Navigation</span>
          <button onClick={onCloseMobile} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher: Workbench vs DevTools */}
        <div className="p-2 border-b border-surface-800 grid grid-cols-2 gap-1 bg-surface-950/40">
          <button
            onClick={() => onSwitchView('workbench')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition ${
              activeView === 'workbench'
                ? 'bg-surface-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-800/40'
            }`}
          >
            <Folder className="w-3.5 h-3.5 text-brand-400" />
            <span>API Client</span>
          </button>
          <button
            onClick={() => onSwitchView('devtools')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition ${
              activeView === 'devtools'
                ? 'bg-surface-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-800/40'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>Dev Tools</span>
          </button>
        </div>

        {activeView === 'workbench' ? (
          <>
            {/* Tabs Header */}
            <div className="flex items-center border-b border-surface-800 px-3 pt-2 gap-2 text-xs">
              <button
                onClick={() => setActiveTab('collections')}
                className={`pb-2 px-1 font-medium transition border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'collections'
                    ? 'border-brand-500 text-brand-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Collections</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-2 px-1 font-medium transition border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'border-brand-500 text-brand-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>History ({history.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-surface-800">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-950/70 border border-surface-750 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500/50"
                />
              </div>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {activeTab === 'collections' ? (
                <>
                  <div className="flex items-center justify-between px-2 py-1 mb-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Workspaces
                    </span>
                    <button
                      onClick={() => setIsAddingCollection(!isAddingCollection)}
                      className="p-1 text-slate-400 hover:text-brand-400 hover:bg-surface-800 rounded transition"
                      title="New Collection Folder"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isAddingCollection && (
                    <form onSubmit={handleCreateCollection} className="p-2 mb-2 bg-surface-950 rounded-lg border border-surface-700">
                      <input
                        type="text"
                        placeholder="Collection name..."
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        autoFocus
                        className="w-full bg-surface-800 border border-surface-700 rounded px-2 py-1 text-xs text-white focus:outline-none mb-2"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIsAddingCollection(false)}
                          className="px-2 py-0.5 text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-2.5 py-0.5 text-xs bg-brand-600 hover:bg-brand-500 text-white rounded font-medium"
                        >
                          Add
                        </button>
                      </div>
                    </form>
                  )}

                  {filteredCollections.map((col) => {
                    const isExpanded = expandedCollections[col.id] ?? true;
                    return (
                      <div key={col.id} className="space-y-0.5">
                        <div
                          onClick={() => toggleCollection(col.id)}
                          className="group flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-surface-800 hover:text-white cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <Folder className="w-3.5 h-3.5 text-teal-400/80" />
                            <span className="truncate">{col.name}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete collection "${col.name}"?`)) {
                                onDeleteCollection(col.id);
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition"
                            title="Delete Collection"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="pl-4 space-y-0.5">
                            {col.requests.length === 0 ? (
                              <div className="text-[11px] text-slate-500 px-3 py-1 italic">
                                No requests in folder
                              </div>
                            ) : (
                              col.requests.map((req) => (
                                <div
                                  key={req.id}
                                  onClick={() => {
                                    onSelectRequest(req);
                                    onCloseMobile();
                                  }}
                                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition ${
                                    activeRequestId === req.id
                                      ? 'bg-brand-500/15 text-white font-medium border border-brand-500/30'
                                      : 'text-slate-300 hover:bg-surface-800 hover:text-white'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span
                                      className={`text-[9px] font-mono px-1 py-0.5 rounded border font-semibold ${getMethodColor(
                                        req.method
                                      )}`}
                                    >
                                      {req.method}
                                    </span>
                                    <span className="truncate">{req.name}</span>
                                  </div>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteRequestFromCollection(col.id, req.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between px-2 py-1 mb-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Recent Requests
                    </span>
                    {history.length > 0 && (
                      <button
                        onClick={onClearHistory}
                        className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                        Clear All
                      </button>
                    )}
                  </div>

                  {filteredHistory.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">
                      No history yet. Execute requests to see records here.
                    </div>
                  ) : (
                    filteredHistory.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onSelectHistoryItem(item);
                          onCloseMobile();
                        }}
                        className="p-2 rounded-lg text-xs hover:bg-surface-800 cursor-pointer border border-transparent hover:border-surface-700/60 transition"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9px] font-mono px-1 py-0.5 rounded border font-semibold ${getMethodColor(
                                item.request.method
                              )}`}
                            >
                              {item.request.method}
                            </span>
                            <span
                              className={`text-[10px] font-mono font-bold ${getStatusColor(
                                item.response.status
                              )}`}
                            >
                              {item.response.status || 'ERR'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {item.response.duration}ms
                          </span>
                        </div>
                        <div className="text-slate-300 font-mono text-[11px] truncate">
                          {item.request.url}
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          /* DevTools Navigation Info */
          <div className="p-4 text-xs text-slate-400 space-y-3">
            <div className="font-semibold text-slate-200">Developer Swiss-Army Toolkit</div>
            <p className="text-[11px] leading-relaxed">
              Explore offline utility modules: JWT inspection, JSON beautification, Base64 encoding, UUID generation, and network latency probe.
            </p>
            <div className="pt-2 border-t border-surface-800 text-[11px] text-teal-400">
              Active in the main stage!
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
