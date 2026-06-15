import { http, HttpResponse } from 'msw';

export const ipamHandlers = [
  http.get('/api/ipam/prefixes', () =>
    HttpResponse.json([
      { id: 1, prefix: '10.0.0.0/24', description: '', vlan: null, site: null, role: null }
    ])
  )
];
