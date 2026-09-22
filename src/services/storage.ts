import { Collection, Environment, HistoryItem, ApiRequest } from '../types';

const STORAGE_KEYS = {
  COLLECTIONS: 'pulsedesk_collections_v1',
  ENVIRONMENTS: 'pulsedesk_environments_v1',
  ACTIVE_ENV_ID: 'pulsedesk_active_env_id_v1',
  HISTORY: 'pulsedesk_history_v1',
  ACTIVE_REQUEST: 'pulsedesk_active_request_v1'
};

export const DEFAULT_REQUEST: ApiRequest = {
  id: 'default-req-1',
  name: 'Get User Posts',
  method: 'GET',
  url: '{{baseUrl}}/posts/1',
  params: [
    { id: 'p1', key: '_expand', value: 'user', enabled: false, description: 'Include user details' }
  ],
  headers: [
    { id: 'h1', key: 'Accept', value: 'application/json', enabled: true },
    { id: 'h2', key: 'User-Agent', value: 'PulseDesk-Client/1.0', enabled: false }
  ],
  bodyType: 'none',
  bodyContent: '{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}'
};

const DEFAULT_ENVIRONMENTS: Environment[] = [
  {
    id: 'env-dev',
    name: 'Development',
    variables: [
      { id: 'v1', key: 'baseUrl', value: 'https://jsonplaceholder.typicode.com', enabled: true, description: 'Mock REST API root' },
      { id: 'v2', key: 'apiKey', value: 'dev_sk_948172653', enabled: true, description: 'Dev auth key' }
    ]
  },
  {
    id: 'env-prod',
    name: 'Production',
    variables: [
      { id: 'v3', key: 'baseUrl', value: 'https://api.github.com', enabled: true, description: 'GitHub REST API' },
      { id: 'v4', key: 'apiKey', value: 'prod_sk_live_99182', enabled: true, description: 'Live key' }
    ]
  }
];

const DEFAULT_COLLECTIONS: Collection[] = [
  {
    id: 'col-jsonplaceholder',
    name: 'JSONPlaceholder API',
    requests: [
      {
        id: 'req-get-post',
        name: 'Get Post #1',
        method: 'GET',
        url: '{{baseUrl}}/posts/1',
        params: [],
        headers: [{ id: 'h-1', key: 'Accept', value: 'application/json', enabled: true }],
        bodyType: 'none',
        bodyContent: ''
      },
      {
        id: 'req-create-post',
        name: 'Create New Post',
        method: 'POST',
        url: '{{baseUrl}}/posts',
        params: [],
        headers: [{ id: 'h-2', key: 'Content-Type', value: 'application/json', enabled: true }],
        bodyType: 'json',
        bodyContent: '{\n  "title": "Exploring Cross-Platform Apps",\n  "body": "PulseDesk built with React & Electron",\n  "userId": 42\n}'
      },
      {
        id: 'req-get-users',
        name: 'List All Users',
        method: 'GET',
        url: '{{baseUrl}}/users',
        params: [{ id: 'p-1', key: '_limit', value: '5', enabled: true }],
        headers: [],
        bodyType: 'none',
        bodyContent: ''
      }
    ]
  },
  {
    id: 'col-httpbin',
    name: 'HTTP Testing Utilities',
    requests: [
      {
        id: 'req-httpbin-headers',
        name: 'Inspect Client Headers',
        method: 'GET',
        url: 'https://httpbin.org/headers',
        params: [],
        headers: [{ id: 'h-3', key: 'X-PulseDesk-Client', value: 'Active', enabled: true }],
        bodyType: 'none',
        bodyContent: ''
      },
      {
        id: 'req-httpbin-ip',
        name: 'Check Origin IP',
        method: 'GET',
        url: 'https://httpbin.org/ip',
        params: [],
        headers: [],
        bodyType: 'none',
        bodyContent: ''
      }
    ]
  }
];

export function loadCollections(): Collection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
    return raw ? JSON.parse(raw) : DEFAULT_COLLECTIONS;
  } catch {
    return DEFAULT_COLLECTIONS;
  }
}

export function saveCollections(collections: Collection[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
  } catch (e) {
    console.error('Failed to save collections', e);
  }
}

export function loadEnvironments(): Environment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENVIRONMENTS);
    return raw ? JSON.parse(raw) : DEFAULT_ENVIRONMENTS;
  } catch {
    return DEFAULT_ENVIRONMENTS;
  }
}

export function saveEnvironments(environments: Environment[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ENVIRONMENTS, JSON.stringify(environments));
  } catch (e) {
    console.error('Failed to save environments', e);
  }
}

export function loadActiveEnvId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_ENV_ID) || 'env-dev';
  } catch {
    return 'env-dev';
  }
}

export function saveActiveEnvId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ENV_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ENV_ID);
    }
  } catch (e) {
    console.error('Failed to save active environment id', e);
  }
}

export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistory(history: HistoryItem[]): void {
  try {
    // Keep last 40 items
    const capped = history.slice(0, 40);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(capped));
  } catch (e) {
    console.error('Failed to save history', e);
  }
}

export function loadActiveRequest(): ApiRequest {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_REQUEST);
    return raw ? JSON.parse(raw) : DEFAULT_REQUEST;
  } catch {
    return DEFAULT_REQUEST;
  }
}

export function saveActiveRequest(request: ApiRequest): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_REQUEST, JSON.stringify(request));
  } catch (e) {
    console.error('Failed to save active request', e);
  }
}
