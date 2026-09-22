import React from 'react';
import { Activity, Layers, Code, Settings, Plus, Menu, Globe, Laptop } from 'lucide-react';
import { Environment, PlatformInfo } from '../types';

interface HeaderProps {
  environments: Environment[];
  activeEnvId: string | null;
  onSelectEnvironment: (id: string | null) => void;
  onOpenEnvModal: () => void;
  onOpenCurlModal: () => void;
  onNewRequest: () => void;
  onToggleSidebar: () => void;
  platformInfo: PlatformInfo | null;
}

export const Header: React.FC<HeaderProps> = ({
  environments,
  activeEnvId,
  onSelectEnvironment,
  onOpenEnvModal,
  onOpenCurlModal,
  onNewRequest,
  onToggleSidebar,
  platformInfo
}) => {
  return (
    <header className="h-14 border-b border-surface-800 bg-surface-900/90 backdrop-blur px-4 flex items-center justify-between select-none z-20">
      {/* Left: Brand & Mobile Menu */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-surface-800 rounded-lg transition"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Activity className="w-5 h-5 text-surface-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">PulseDesk</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                v1.0
              </span>
            </div>
          </div>
        </div>

        {/* Platform Badge */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-surface-800/80 border border-surface-700 text-slate-300">
          {platformInfo?.isElectron ? (
            <>
              <Laptop className="w-3.5 h-3.5 text-teal-400" />
              <span>Electron Desktop ({platformInfo.platform})</span>
            </>
          ) : (
            <>
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Web / PWA Mode</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Actions & Environment Selector */}
      <div className="flex items-center gap-2">
        {/* Environment Picker */}
        <div className="flex items-center rounded-lg bg-surface-800 border border-surface-700/80 p-0.5">
          <Layers className="w-4 h-4 text-slate-400 ml-2" />
          <select
            value={activeEnvId || ''}
            onChange={(e) => onSelectEnvironment(e.target.value || null)}
            className="bg-transparent text-xs text-slate-200 py-1 px-2 focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-surface-900 text-slate-300">No Environment</option>
            {environments.map((env) => (
              <option key={env.id} value={env.id} className="bg-surface-900 text-slate-200">
                {env.name}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenEnvModal}
            className="p-1 text-slate-400 hover:text-brand-400 hover:bg-surface-700/50 rounded transition"
            title="Configure Environments"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Import cURL */}
        <button
          onClick={onOpenCurlModal}
          className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-surface-800 hover:bg-surface-700 border border-surface-700/80 px-2.5 py-1.5 rounded-lg transition"
        >
          <Code className="w-3.5 h-3.5 text-brand-400" />
          <span>cURL</span>
        </button>

        {/* New Request */}
        <button
          onClick={onNewRequest}
          className="flex items-center gap-1.5 text-xs font-medium text-surface-950 bg-gradient-to-r from-teal-400 to-brand-500 hover:from-teal-300 hover:to-brand-400 px-3 py-1.5 rounded-lg shadow-sm shadow-teal-500/20 transition"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">New Request</span>
        </button>
      </div>
    </header>
  );
};
