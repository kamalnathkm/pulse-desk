export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type BodyType = 'none' | 'json' | 'raw' | 'form-data';

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export interface ApiRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  bodyType: BodyType;
  bodyContent: string;
  collectionId?: string;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: string;
  duration: number;
  size: number;
  timestamp: number;
  error?: string;
}

export interface Collection {
  id: string;
  name: string;
  requests: ApiRequest[];
}

export interface Environment {
  id: string;
  name: string;
  variables: KeyValuePair[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  request: ApiRequest;
  response: ApiResponse;
}

export interface PlatformInfo {
  isElectron: boolean;
  platform: string;
  version?: string;
  nodeVersion?: string;
  electronVersion?: string;
}

declare global {
  interface Window {
    api?: {
      getPlatformInfo: () => Promise<PlatformInfo>;
      sendRequest: (options: {
        url: string;
        method: string;
        headers: Record<string, string>;
        body?: string | null;
      }) => Promise<{
        success: boolean;
        status?: number;
        statusText?: string;
        headers?: Record<string, string>;
        data?: string;
        duration: number;
        size: number;
        error?: string;
      }>;
    };
  }
}
