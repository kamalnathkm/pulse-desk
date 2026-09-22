import { ApiRequest, ApiResponse, Environment } from '../types';
import { substituteVariables, buildFullUrl } from './environment';

export async function executeRequest(
  request: ApiRequest,
  activeEnvironment?: Environment | null
): Promise<ApiResponse> {
  const substitutedUrl = substituteVariables(request.url, activeEnvironment);
  const fullUrl = buildFullUrl(substitutedUrl, request.params);

  // Prepare headers
  const headersMap: Record<string, string> = {};
  request.headers
    .filter((h) => h.enabled && h.key.trim())
    .forEach((h) => {
      const key = substituteVariables(h.key.trim(), activeEnvironment);
      const val = substituteVariables(h.value.trim(), activeEnvironment);
      headersMap[key] = val;
    });

  // Prepare body
  let bodyToSend: string | null = null;
  if (request.bodyType !== 'none' && !['GET', 'HEAD'].includes(request.method)) {
    bodyToSend = substituteVariables(request.bodyContent, activeEnvironment);
    if (request.bodyType === 'json' && !headersMap['Content-Type'] && !headersMap['content-type']) {
      headersMap['Content-Type'] = 'application/json';
    }
  }

  const startTime = performance.now();

  // Mode 1: Check if running inside Electron Native Desktop Bridge
  if (window.api && typeof window.api.sendRequest === 'function') {
    try {
      const result = await window.api.sendRequest({
        url: fullUrl,
        method: request.method,
        headers: headersMap,
        body: bodyToSend
      });

      if (!result.success) {
        return {
          status: 0,
          statusText: 'Request Failed',
          headers: {},
          data: '',
          duration: Math.round(result.duration),
          size: 0,
          timestamp: Date.now(),
          error: result.error || 'Network error encountered in native bridge.'
        };
      }

      return {
        status: result.status || 200,
        statusText: result.statusText || 'OK',
        headers: result.headers || {},
        data: result.data || '',
        duration: Math.round(result.duration),
        size: result.size || 0,
        timestamp: Date.now()
      };
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      return {
        status: 0,
        statusText: 'Native Bridge Error',
        headers: {},
        data: '',
        duration,
        size: 0,
        timestamp: Date.now(),
        error: err.message || 'Error communicating with desktop process.'
      };
    }
  }

  // Mode 2: Web / Browser / PWA Mode
  try {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers: headersMap,
      mode: 'cors'
    };

    if (bodyToSend && !['GET', 'HEAD'].includes(request.method)) {
      fetchOptions.body = bodyToSend;
    }

    const res = await fetch(fullUrl, fetchOptions);
    const duration = Math.round(performance.now() - startTime);

    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((val, key) => {
      responseHeaders[key] = val;
    });

    let rawData = '';
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        const json = await res.json();
        rawData = JSON.stringify(json, null, 2);
      } catch {
        rawData = await res.text();
      }
    } else {
      rawData = await res.text();
    }

    const size = new Blob([rawData]).size;

    return {
      status: res.status,
      statusText: res.statusText || (res.ok ? 'OK' : 'Error'),
      headers: responseHeaders,
      data: rawData,
      duration,
      size,
      timestamp: Date.now()
    };
  } catch (err: any) {
    const duration = Math.round(performance.now() - startTime);
    const isCorsLikely = err.message && err.message.toLowerCase().includes('failed to fetch');
    const errorDetails = isCorsLikely
      ? `Failed to fetch (${err.message}). This is typically caused by Browser CORS security restrictions, an invalid SSL certificate, or an offline server. When running PulseDesk in Desktop Mode (Electron), CORS is automatically bypassed!`
      : err.message || 'Request failed';

    return {
      status: 0,
      statusText: 'Error',
      headers: {},
      data: '',
      duration,
      size: 0,
      timestamp: Date.now(),
      error: errorDetails
    };
  }
}
