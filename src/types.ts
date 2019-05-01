export interface ModuleConfig {
  baseURL: string;
  params?: Record<string, string>;
}

export interface ModuleConfigCollection {
  [key: string]: ModuleConfig;
}

export interface ProxyRequestInfo {
  method: string;
  baseURL: string;
  url: string;
  params: Record<string, string>;
}

export interface ProxyResponseInfo {
  status: number;
  data: string;
}
