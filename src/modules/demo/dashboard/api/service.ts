// ============================================================
// Dashboard Service — Data Access Layer
// ============================================================
// This is the ONLY file you modify when connecting to your backend.
// Queries (queries.ts) and components import from here — they never change.
//
// Pick your pattern and replace the function bodies below:
//
// 1. Production (Prisma):
//    → import { prisma } from '@/lib/prisma'
//    → Call Prisma directly in each function
//
// 2. Production (Route Handlers + Prisma):
//    → import { apiClient } from '@/lib/api-client'
//    → return apiClient<Dashboard[]>('/api/dashboards?...')
//    → Create Route Handlers in src/app/api/dashboards/
//
// Current: Mock (in-memory store for demo/development)
// ============================================================

export {
  getDashboards,
  getDashboardById,
  createDashboard,
  updateDashboard,
  deleteDashboard,
  getFolders,
  getFolderById,
  getFolderPath,
  createFolder,
  updateFolder,
  deleteFolder,
  isFolderTitleTaken,
  isDashboardTitleTaken,
  batchMove
} from './mock-store';
