export type ApiCategory =
  | 'automation'
  | 'monitoring'
  | 'network'
  | 'storage'
  | 'compute'
  | 'security'
  | 'other';

export type SpecStatus = 'draft' | 'stable' | 'deprecated';

export interface ApiSpecMeta {
  id: string;
  title: string;
  description: string;
  specUrl: string;
  category: ApiCategory;
  version: string;
  versions?: string[];
  tags: string[];
  status: SpecStatus;
  icon: string;
  officialDocsUrl?: string;
  githubUrl?: string;
}

export interface ApiSpecServerConfig {
  authTypes?: ('api-key' | 'jwt' | 'basic' | 'oauth2')[];
  baseUrl?: string;
  rateLimit?: string;
}
