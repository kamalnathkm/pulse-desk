import React, { useState } from 'react';
import { X, Plus, Trash2, Layers, Check } from 'lucide-react';
import { Environment, KeyValuePair } from '../types';

interface EnvironmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  environments: Environment[];
  onSaveEnvironments: (envs: Environment[]) => void;
}

export const EnvironmentModal: React.FC<EnvironmentModalProps> = ({
  isOpen,
  onClose,
  environments,
  onSaveEnvironments
}) => {
  const [localEnvs, setLocalEnvs] = useState<Environment[]>(environments);
  const [selectedEnvId, setSelectedEnvId] = useState<string>(environments[0]?.id || '');
  const [newEnvName, setNewEnvName] = useState('');
  const [isAddingEnv, setIsAddingEnv] = useState(false);

  if (!isOpen) return null;

  const currentEnv = localEnvs.find((e) => e.id === selectedEnvId) || localEnvs[0];

  const handleAddVariable = () => {
    if (!currentEnv) return;
    const newVar: KeyValuePair = {
      id: Math.random().toString(36).substring(2, 9),
      key: '',
      value: '',
      enabled: true
    };
    const updated = localEnvs.map((env) =>
      env.id === currentEnv.id ? { ...env, variables: [...env.variables, newVar] } : env
    );
    setLocalEnvs(updated);
  };

  const handleUpdateVariable = (id: string, updates: Partial<KeyValuePair>) => {
    if (!currentEnv) return;
    const updatedVars = currentEnv.variables.map((v) => (v.id === id ? { ...v, ...updates } : v));
    const updated = localEnvs.map((env) =>
      env.id === currentEnv.id ? { ...env, variables: updatedVars } : env
    );
    setLocalEnvs(updated);
  };

  const handleDeleteVariable = (id: string) => {
    if (!currentEnv) return;
    const updatedVars = currentEnv.variables.filter((v) => v.id !== id);
    const updated = localEnvs.map((env) =>
      env.id === currentEnv.id ? { ...env, variables: updatedVars } : env
    );
    setLocalEnvs(updated);
  };

  const handleCreateEnvironment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnvName.trim()) return;
    const newEnv: Environment = {
      id: 'env-' + Math.random().toString(36).substring(2, 9),
      name: newEnvName.trim(),
      variables: []
    };
    const updated = [...localEnvs, newEnv];
    setLocalEnvs(updated);
    setSelectedEnvId(newEnv.id);
    setNewEnvName('');
    setIsAddingEnv(false);
  };

  const handleDeleteEnvironment = (id: string) => {
    if (localEnvs.length <= 1) {
      alert('At least one environment must exist.');
      return;
    }
    const updated = localEnvs.filter((e) => e.id !== id);
    setLocalEnvs(updated);
    if (selectedEnvId === id) {
      setSelectedEnvId(updated[0].id);
    }
  };

  const handleSaveAndClose = () => {
    onSaveEnvironments(localEnvs);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-900 border border-surface-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-surface-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-400" />
            <span className="font-semibold text-sm text-white">Environment Variables</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Environments List (Left Column) */}
          <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-surface-800 p-3 bg-surface-950/50 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Profiles</span>
              <button
                onClick={() => setIsAddingEnv(!isAddingEnv)}
                className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> New
              </button>
            </div>

            {isAddingEnv && (
              <form onSubmit={handleCreateEnvironment} className="mb-2 space-y-1">
                <input
                  type="text"
                  placeholder="Environment name..."
                  value={newEnvName}
                  onChange={(e) => setNewEnvName(e.target.value)}
                  autoFocus
                  className="w-full bg-surface-800 border border-surface-700 rounded px-2 py-1 text-xs text-white focus:outline-none"
                />
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingEnv(false)}
                    className="px-2 py-0.5 text-[10px] text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-2 py-0.5 text-[10px] bg-brand-600 text-white rounded font-medium"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-1 overflow-y-auto flex-1">
              {localEnvs.map((env) => (
                <div
                  key={env.id}
                  onClick={() => setSelectedEnvId(env.id)}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition ${
                    selectedEnvId === env.id
                      ? 'bg-brand-500/20 text-brand-300 font-semibold border border-brand-500/40'
                      : 'text-slate-300 hover:bg-surface-800'
                  }`}
                >
                  <span className="truncate">{env.name}</span>
                  {localEnvs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEnvironment(env.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Variables Table (Right Column) */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400">
                Variables for <strong className="text-slate-200">{currentEnv?.name}</strong>
              </span>
              <button
                onClick={handleAddVariable}
                className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Add Variable
              </button>
            </div>

            {!currentEnv || currentEnv.variables.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500 border border-dashed border-surface-800 rounded-lg">
                No variables in this environment. Reference with <span className="font-mono text-teal-400">{'{{variableName}}'}</span> in URL or headers.
              </div>
            ) : (
              <div className="border border-surface-800 rounded-lg overflow-hidden divide-y divide-surface-800">
                {currentEnv.variables.map((v) => (
                  <div key={v.id} className="flex items-center gap-2 p-2 bg-surface-950/60 text-xs">
                    <input
                      type="checkbox"
                      checked={v.enabled}
                      onChange={(e) => handleUpdateVariable(v.id, { enabled: e.target.checked })}
                      className="rounded bg-surface-800 border-surface-700 text-brand-500 focus:ring-0"
                    />
                    <input
                      type="text"
                      placeholder="VARIABLE_NAME"
                      value={v.key}
                      onChange={(e) => handleUpdateVariable(v.id, { key: e.target.value })}
                      className="w-1/3 bg-surface-900 border border-surface-800 rounded px-2 py-1 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-brand-500/50"
                    />
                    <input
                      type="text"
                      placeholder="value"
                      value={v.value}
                      onChange={(e) => handleUpdateVariable(v.id, { value: e.target.value })}
                      className="flex-1 bg-surface-900 border border-surface-800 rounded px-2 py-1 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-brand-500/50"
                    />
                    <button
                      onClick={() => handleDeleteVariable(v.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-surface-800 flex justify-end gap-2 bg-surface-950/60">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAndClose}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-surface-950 font-semibold text-xs rounded-lg shadow-sm transition"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
