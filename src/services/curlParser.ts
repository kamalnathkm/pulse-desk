import { ApiRequest, HttpMethod, KeyValuePair } from '../types';

export function parseCurl(curlString: string): Partial<ApiRequest> | null {
  const cleanStr = curlString.trim().replace(/\\\r?\n/g, ' ');
  if (!cleanStr.startsWith('curl')) {
    return null;
  }

  let method: HttpMethod = 'GET';
  let url = '';
  const headers: KeyValuePair[] = [];
  let bodyContent = '';
  let bodyType: 'none' | 'json' | 'raw' = 'none';

  // Extract URL (first token not starting with - or following an option)
  const tokens = cleanStr.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];

  for (let i = 1; i < tokens.length; i++) {
    let token = tokens[i].trim();
    const unquoted = token.replace(/^['"]|['"]$/g, '');

    if (token === '-X' || token === '--request') {
      if (i + 1 < tokens.length) {
        const m = tokens[++i].replace(/^['"]|['"]$/g, '').toUpperCase();
        if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].includes(m)) {
          method = m as HttpMethod;
        }
      }
    } else if (token === '-H' || token === '--header') {
      if (i + 1 < tokens.length) {
        const headerVal = tokens[++i].replace(/^['"]|['"]$/g, '');
        const colonIdx = headerVal.indexOf(':');
        if (colonIdx > 0) {
          const key = headerVal.substring(0, colonIdx).trim();
          const value = headerVal.substring(colonIdx + 1).trim();
          headers.push({
            id: Math.random().toString(36).substring(2, 9),
            key,
            value,
            enabled: true
          });
        }
      }
    } else if (token === '-d' || token === '--data' || token === '--data-raw') {
      if (i + 1 < tokens.length) {
        bodyContent = tokens[++i].replace(/^['"]|['"]$/g, '');
        if (method === 'GET') method = 'POST';
        try {
          JSON.parse(bodyContent);
          bodyType = 'json';
        } catch {
          bodyType = 'raw';
        }
      }
    } else if (!token.startsWith('-') && !url) {
      url = unquoted;
    }
  }

  // Extract params from URL if present
  const params: KeyValuePair[] = [];
  try {
    const parsedUrl = new URL(url);
    parsedUrl.searchParams.forEach((value, key) => {
      params.push({
        id: Math.random().toString(36).substring(2, 9),
        key,
        value,
        enabled: true
      });
    });
    // Clean base URL without query string
    url = `${parsedUrl.origin}${parsedUrl.pathname}`;
  } catch {
    // If URL is relative or invalid URL syntax, keep as is
    if (url.includes('?')) {
      const [base, query] = url.split('?');
      url = base;
      const searchParams = new URLSearchParams(query);
      searchParams.forEach((value, key) => {
        params.push({
          id: Math.random().toString(36).substring(2, 9),
          key,
          value,
          enabled: true
        });
      });
    }
  }

  return {
    method,
    url,
    headers,
    params,
    bodyType,
    bodyContent
  };
}

export function generateCurl(request: ApiRequest, fullUrl: string): string {
  let curl = `curl --request ${request.method} \\\n  --url '${fullUrl}'`;

  const activeHeaders = request.headers.filter((h) => h.enabled && h.key.trim());
  activeHeaders.forEach((h) => {
    curl += ` \\\n  --header '${h.key.trim()}: ${h.value.trim()}'`;
  });

  if (request.bodyType !== 'none' && request.bodyContent.trim() && !['GET', 'HEAD'].includes(request.method)) {
    // Escape single quotes for bash compatibility
    const escaped = request.bodyContent.replace(/'/g, "'\\''");
    curl += ` \\\n  --data '${escaped}'`;
  }

  return curl;
}
