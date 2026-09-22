import React, { useState } from 'react';
import {
  Key,
  Braces,
  Binary,
  Hash,
  Activity,
  Copy,
  Check,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const DevToolsHub: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'jwt' | 'json' | 'base64' | 'uuid' | 'ping'>('jwt');
  const [copied, setCopied] = useState<string | null>(null);

  // JWT state
  const [jwtInput, setJwtInput] = useState(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsZXggRGV2ZWxvcGVyIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoyMDAwMDAwMDAwfQ.5fN7Wc-B2VpL0x1Q4u9e5J_8M_o'
  );

  // JSON state
  const [jsonInput, setJsonInput] = useState('{"id":101,"title":"PulseDesk App","features":["cross-platform","electron","pwa","devtools"],"active":true}');
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Base64 state
  const [base64Input, setBase64Input] = useState('Hello from PulseDesk Cross-Platform Hub!');
  const [base64Output, setBase64Output] = useState('');
  const [base64Mode, setBase64Mode] = useState<'encode' | 'decode'>('encode');

  // UUID state
  const [uuidList, setUuidList] = useState<string[]>([]);
  const [uuidCount, setUuidCount] = useState(5);

  // Ping probe state
  const [pingUrl, setPingUrl] = useState('https://jsonplaceholder.typicode.com');
  const [pingResults, setPingResults] = useState<{ time: number; status: string }[]>([]);
  const [isPinging, setIsPinging] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // JWT parsing
  const parseJwt = () => {
    try {
      const parts = jwtInput.trim().split('.');
      if (parts.length < 2) return { error: 'Invalid JWT structure. Needs header and payload parts.' };

      const decodePart = (str: string) => {
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
      };

      const header = decodePart(parts[0]);
      const payload = decodePart(parts[1]);

      let isExpired = false;
      let expDateStr = 'No expiration claim';
      if (payload.exp) {
        const expTime = payload.exp * 1000;
        isExpired = Date.now() > expTime;
        expDateStr = new Date(expTime).toLocaleString();
      }

      return { header, payload, isExpired, expDateStr, error: null };
    } catch (e: any) {
      return { error: 'Failed to decode JWT token: ' + (e.message || 'Invalid string') };
    }
  };

  // JSON formatters
  const handlePrettifyJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message);
    }
  };

  const handleMinifyJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed));
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message);
    }
  };

  // Base64 / URL converter
  const handleConvertBase64 = () => {
    try {
      if (base64Mode === 'encode') {
        setBase64Output(btoa(base64Input));
      } else {
        setBase64Output(atob(base64Input));
      }
    } catch (err: any) {
      setBase64Output(`Error: ${err.message}`);
    }
  };

  // UUID Generator
  const generateUuids = () => {
    const list: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      list.push(crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }));
    }
    setUuidList(list);
  };

  // Ping Latency Probe
  const handlePing = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      await fetch(pingUrl, { method: 'HEAD', mode: 'no-cors' });
      const duration = Math.round(performance.now() - start);
      setPingResults((prev) => [{ time: duration, status: 'Success' }, ...prev.slice(0, 9)]);
    } catch {
      const duration = Math.round(performance.now() - start);
      setPingResults((prev) => [{ time: duration, status: 'Failed / Blocked' }, ...prev.slice(0, 9)]);
    } finally {
      setIsPinging(false);
    }
  };

  const jwtDetails = parseJwt();

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-950 overflow-hidden">
      {/* Sub-header tabs for DevTools */}
      <div className="flex items-center px-4 border-b border-surface-800 gap-2 bg-surface-900 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTool('jwt')}
          className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTool === 'jwt'
              ? 'border-amber-400 text-amber-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <span>JWT Decoder</span>
        </button>

        <button
          onClick={() => setActiveTool('json')}
          className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTool === 'json'
              ? 'border-teal-400 text-teal-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Braces className="w-3.5 h-3.5 text-teal-400" />
          <span>JSON Tools</span>
        </button>

        <button
          onClick={() => setActiveTool('base64')}
          className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTool === 'base64'
              ? 'border-sky-400 text-sky-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Binary className="w-3.5 h-3.5 text-sky-400" />
          <span>Base64 / URL</span>
        </button>

        <button
          onClick={() => setActiveTool('uuid')}
          className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTool === 'uuid'
              ? 'border-purple-400 text-purple-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Hash className="w-3.5 h-3.5 text-purple-400" />
          <span>UUID Generator</span>
        </button>

        <button
          onClick={() => setActiveTool('ping')}
          className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTool === 'ping'
              ? 'border-emerald-400 text-emerald-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Latency Probe</span>
        </button>
      </div>

      {/* Tool Content Panels */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* JWT TOOL */}
        {activeTool === 'jwt' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Encoded JWT Token
              </label>
              <textarea
                rows={3}
                value={jwtInput}
                onChange={(e) => setJwtInput(e.target.value)}
                placeholder="Paste encoded JWT here..."
                className="w-full bg-surface-900 border border-surface-800 rounded-lg p-3 font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {jwtDetails.error ? (
              <div className="p-3 bg-rose-950/20 border border-rose-800/40 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>{jwtDetails.error}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Header */}
                <div className="p-4 bg-surface-900 border border-surface-800 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase text-rose-400 font-mono">
                      Header: Algorithm & Token Type
                    </span>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(jwtDetails.header, null, 2), 'jwt-hdr')}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      {copied === 'jwt-hdr' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="p-3 bg-surface-950 rounded-lg font-mono text-xs text-rose-300 overflow-x-auto">
                    {JSON.stringify(jwtDetails.header, null, 2)}
                  </pre>
                </div>

                {/* Payload */}
                <div className="p-4 bg-surface-900 border border-surface-800 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase text-purple-400 font-mono">
                        Payload: Claims & Data
                      </span>
                      {jwtDetails.payload?.exp && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            jwtDetails.isExpired
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {jwtDetails.isExpired ? 'EXPIRED' : 'VALID'}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(jwtDetails.payload, null, 2), 'jwt-pld')}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      {copied === 'jwt-pld' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="p-3 bg-surface-950 rounded-lg font-mono text-xs text-purple-300 overflow-x-auto">
                    {JSON.stringify(jwtDetails.payload, null, 2)}
                  </pre>
                  {jwtDetails.payload?.exp && (
                    <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Expires: {jwtDetails.expDateStr}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* JSON TOOL */}
        {activeTool === 'json' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrettifyJson}
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-surface-950 font-semibold text-xs rounded-lg transition"
              >
                Prettify JSON
              </button>
              <button
                onClick={handleMinifyJson}
                className="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 text-slate-200 text-xs rounded-lg transition"
              >
                Minify JSON
              </button>
            </div>

            {jsonError && (
              <div className="p-2.5 bg-rose-950/20 border border-rose-800/40 text-rose-300 text-xs rounded-lg font-mono">
                {jsonError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Input JSON</label>
                <textarea
                  rows={14}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-800 rounded-lg p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-brand-500/50 resize-none"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-400">Formatted Output</label>
                  {jsonOutput && (
                    <button
                      onClick={() => copyToClipboard(jsonOutput, 'json-out')}
                      className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1"
                    >
                      {copied === 'json-out' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  )}
                </div>
                <textarea
                  readOnly
                  rows={14}
                  value={jsonOutput}
                  placeholder="Formatted JSON appears here..."
                  className="w-full bg-surface-950 border border-surface-800 rounded-lg p-3 font-mono text-xs text-teal-300 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* BASE64 TOOL */}
        {activeTool === 'base64' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setBase64Mode('encode')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  base64Mode === 'encode' ? 'bg-sky-500 text-surface-950 font-bold' : 'bg-surface-800 text-slate-300'
                }`}
              >
                Encode String
              </button>
              <button
                onClick={() => setBase64Mode('decode')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  base64Mode === 'decode' ? 'bg-sky-500 text-surface-950 font-bold' : 'bg-surface-800 text-slate-300'
                }`}
              >
                Decode Base64
              </button>
              <button
                onClick={handleConvertBase64}
                className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-surface-950 font-bold text-xs rounded-lg transition ml-auto"
              >
                Convert
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Input ({base64Mode === 'encode' ? 'Plain Text' : 'Base64 Encoded'})
                </label>
                <textarea
                  rows={10}
                  value={base64Input}
                  onChange={(e) => setBase64Input(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-800 rounded-lg p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-sky-500/50"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-400">Result</label>
                  {base64Output && (
                    <button
                      onClick={() => copyToClipboard(base64Output, 'b64-out')}
                      className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
                    >
                      {copied === 'b64-out' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  )}
                </div>
                <textarea
                  readOnly
                  rows={10}
                  value={base64Output}
                  placeholder="Click Convert to see output..."
                  className="w-full bg-surface-950 border border-surface-800 rounded-lg p-3 font-mono text-xs text-sky-300 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* UUID TOOL */}
        {activeTool === 'uuid' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-400">Quantity:</label>
              <select
                value={uuidCount}
                onChange={(e) => setUuidCount(Number(e.target.value))}
                className="bg-surface-800 border border-surface-700 text-xs text-slate-200 rounded px-2 py-1"
              >
                <option value={1}>1 UUID</option>
                <option value={5}>5 UUIDs</option>
                <option value={10}>10 UUIDs</option>
                <option value={20}>20 UUIDs</option>
              </select>
              <button
                onClick={generateUuids}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-lg transition"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Generate</span>
              </button>
            </div>

            {uuidList.length > 0 ? (
              <div className="p-4 bg-surface-900 border border-surface-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-surface-800">
                  <span className="text-xs font-semibold text-slate-400">Generated UUIDs (v4)</span>
                  <button
                    onClick={() => copyToClipboard(uuidList.join('\n'), 'all-uuid')}
                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    {copied === 'all-uuid' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy All</span>
                  </button>
                </div>
                {uuidList.map((id, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded bg-surface-950/70 border border-surface-800 text-xs font-mono text-purple-300"
                  >
                    <span>{id}</span>
                    <button
                      onClick={() => copyToClipboard(id, `uuid-${index}`)}
                      className="p-1 text-slate-500 hover:text-white"
                    >
                      {copied === `uuid-${index}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-slate-500 border border-dashed border-surface-800 rounded-xl">
                Click &quot;Generate&quot; to create random UUID v4 strings.
              </div>
            )}
          </div>
        )}

        {/* PING PROBE TOOL */}
        {activeTool === 'ping' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="p-4 bg-surface-900 border border-surface-800 rounded-xl space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Target Endpoint Latency Probe
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pingUrl}
                  onChange={(e) => setPingUrl(e.target.value)}
                  placeholder="https://api.example.com"
                  className="flex-1 bg-surface-950 border border-surface-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500/50"
                />
                <button
                  onClick={handlePing}
                  disabled={isPinging}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-surface-950 font-bold text-xs rounded-lg transition"
                >
                  {isPinging ? (
                    <div className="w-3.5 h-3.5 border-2 border-surface-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Activity className="w-3.5 h-3.5" />
                  )}
                  <span>Ping</span>
                </button>
              </div>
            </div>

            {pingResults.length > 0 && (
              <div className="border border-surface-800 rounded-xl overflow-hidden divide-y divide-surface-800">
                {pingResults.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-surface-900/60 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="font-mono text-slate-300">Probe #{pingResults.length - i}</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">{r.time} ms</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
