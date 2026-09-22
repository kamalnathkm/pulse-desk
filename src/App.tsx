import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { RequestEditor } from './components/RequestEditor';
import { ResponseViewer } from './components/ResponseViewer';
import { DevToolsHub } from './components/DevTools/DevToolsHub';
import { EnvironmentModal } from './components/EnvironmentModal';
import { CurlModal } from './components/CurlModal';
import {
  Collection,
  Environment,
  HistoryItem,
  ApiRequest,
  ApiResponse,
  PlatformInfo
} from './types';
import {
  loadCollections,
  saveCollections,
  loadEnvironments,
  saveEnvironments,
  loadActiveEnvId,
  saveActiveEnvId,
  loadHistory,
  saveHistory,
  loadActiveRequest,
  saveActiveRequest,
  DEFAULT_REQUEST
} from './services/storage';
import { executeRequest } from './services/httpClient';

export const App: React.FC = () => {
  // State
  const [collections, setCollections] = useState<Collection[]>(loadCollections);
  const [environments, setEnvironments] = useState<Environment[]>(loadEnvironments);
  const [activeEnvId, setActiveEnvId] = useState<string | null>(loadActiveEnvId);
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);
  const [activeRequest, setActiveRequest] = useState<ApiRequest>(loadActiveRequest);
  const [currentResponse, setCurrentResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo | null>(null);

  // Views & Modals
  const [activeView, setActiveView] = useState<'workbench' | 'devtools'>('workbench');
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
  const [isCurlModalOpen, setIsCurlModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Detect Platform (Electron vs Web)
  useEffect(() => {
    if (window.api && typeof window.api.getPlatformInfo === 'function') {
      window.api.getPlatformInfo().then((info) => {
        setPlatformInfo(info);
      }).catch(() => {
        setPlatformInfo({ isElectron: false, platform: 'web' });
      });
    } else {
      setPlatformInfo({ isElectron: false, platform: 'web' });
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    saveCollections(collections);
  }, [collections]);

  useEffect(() => {
    saveEnvironments(environments);
  }, [environments]);

  useEffect(() => {
    saveActiveEnvId(activeEnvId);
  }, [activeEnvId]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    saveActiveRequest(activeRequest);
  }, [activeRequest]);

  const activeEnvironment = environments.find((e) => e.id === activeEnvId) || null;

  // Actions
  const handleSendRequest = async () => {
    setIsLoading(true);
    setCurrentResponse(null);

    const res = await executeRequest(activeRequest, activeEnvironment);
    setCurrentResponse(res);
    setIsLoading(false);

    // Record in history
    const historyItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      request: { ...activeRequest },
      response: res
    };
    setHistory((prev) => [historyItem, ...prev.slice(0, 39)]);
  };

  const handleNewRequest = () => {
    const newReq: ApiRequest = {
      id: 'req-' + Math.random().toString(36).substring(2, 9),
      name: 'Untitled Request',
      method: 'GET',
      url: '',
      params: [],
      headers: [{ id: 'h1', key: 'Accept', value: 'application/json', enabled: true }],
      bodyType: 'none',
      bodyContent: ''
    };
    setActiveRequest(newReq);
    setCurrentResponse(null);
    setActiveView('workbench');
  };

  const handleSelectSavedRequest = (req: ApiRequest) => {
    setActiveRequest({ ...req });
    setCurrentResponse(null);
    setActiveView('workbench');
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setActiveRequest({ ...item.request });
    setCurrentResponse(item.response);
    setActiveView('workbench');
  };

  const handleSaveToCollection = (collectionId?: string) => {
    const targetColId = collectionId || collections[0]?.id;
    if (!targetColId) return;

    setCollections((prev) =>
      prev.map((col) => {
        if (col.id === targetColId) {
          // Check if request already exists in collection
          const exists = col.requests.some((r) => r.id === activeRequest.id);
          const updatedRequests = exists
            ? col.requests.map((r) => (r.id === activeRequest.id ? { ...activeRequest, collectionId: targetColId } : r))
            : [...col.requests, { ...activeRequest, collectionId: targetColId }];
          return { ...col, requests: updatedRequests };
        }
        return col;
      })
    );
  };

  const handleCreateCollection = (name: string) => {
    const newCol: Collection = {
      id: 'col-' + Math.random().toString(36).substring(2, 9),
      name,
      requests: []
    };
    setCollections((prev) => [...prev, newCol]);
  };

  const handleDeleteCollection = (id: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== id));
  };

  const handleDeleteRequestFromCollection = (collectionId: string, requestId: string) => {
    setCollections((prev) =>
      prev.map((col) =>
        col.id === collectionId
          ? { ...col, requests: col.requests.filter((r) => r.id !== requestId) }
          : col
      )
    );
  };

  const handleClearHistory = () => {
    if (confirm('Clear all request history?')) {
      setHistory([]);
    }
  };

  const handleImportCurl = (parsed: Partial<ApiRequest>) => {
    setActiveRequest((prev) => ({
      ...prev,
      name: parsed.url ? `cURL: ${parsed.url.substring(0, 30)}` : prev.name,
      method: parsed.method || prev.method,
      url: parsed.url || prev.url,
      headers: parsed.headers || prev.headers,
      params: parsed.params || prev.params,
      bodyType: parsed.bodyType || prev.bodyType,
      bodyContent: parsed.bodyContent || prev.bodyContent
    }));
    setActiveView('workbench');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-surface-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        environments={environments}
        activeEnvId={activeEnvId}
        onSelectEnvironment={setActiveEnvId}
        onOpenEnvModal={() => setIsEnvModalOpen(true)}
        onOpenCurlModal={() => setIsCurlModalOpen(true)}
        onNewRequest={handleNewRequest}
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        platformInfo={platformInfo}
      />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          collections={collections}
          history={history}
          activeRequestId={activeRequest.id}
          onSelectRequest={handleSelectSavedRequest}
          onSelectHistoryItem={handleSelectHistoryItem}
          onClearHistory={handleClearHistory}
          onCreateCollection={handleCreateCollection}
          onDeleteCollection={handleDeleteCollection}
          onDeleteRequestFromCollection={handleDeleteRequestFromCollection}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          activeView={activeView}
          onSwitchView={setActiveView}
        />

        {/* Center Stage */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeView === 'workbench' ? (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left Pane: Request Editor */}
              <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col">
                <RequestEditor
                  request={activeRequest}
                  collections={collections}
                  activeEnvironment={activeEnvironment}
                  isLoading={isLoading}
                  onChange={setActiveRequest}
                  onSend={handleSendRequest}
                  onSave={handleSaveToCollection}
                />
              </div>

              {/* Right Pane: Response Viewer */}
              <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col">
                <ResponseViewer response={currentResponse} isLoading={isLoading} />
              </div>
            </div>
          ) : (
            <DevToolsHub />
          )}
        </main>
      </div>

      {/* Modals */}
      <EnvironmentModal
        isOpen={isEnvModalOpen}
        onClose={() => setIsEnvModalOpen(false)}
        environments={environments}
        onSaveEnvironments={setEnvironments}
      />

      <CurlModal
        isOpen={isCurlModalOpen}
        onClose={() => setIsCurlModalOpen(false)}
        onImport={handleImportCurl}
      />
    </div>
  );
};

export default App;
