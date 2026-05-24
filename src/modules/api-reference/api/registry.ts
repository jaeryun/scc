import type { ApiSpecMeta } from './types';

export const apiSpecRegistry: ApiSpecMeta[] = [
  {
    id: 'semaphore',
    title: 'SemaphoreUI',
    description: '오픈소스 Ansible 웹 UI의 REST API 레퍼런스',
    specUrl: '/api-specs/semaphore/latest.json',
    category: 'automation',
    version: 'v2.10.0',
    tags: ['automation', 'ansible', 'ci-cd'],
    status: 'draft',
    icon: 'serverBolt',
    officialDocsUrl: 'https://docs.semaphoreui.com',
    githubUrl: 'https://github.com/semaphoreui/semaphore'
  }
];

export function getSpecById(id: string): ApiSpecMeta | undefined {
  return apiSpecRegistry.find((s) => s.id === id);
}

export function getAllSpecs(): ApiSpecMeta[] {
  return apiSpecRegistry;
}
