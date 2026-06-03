# Zustand Demo Module Pattern

For demo modules where data is purely client-side state (real-time feel, drag-and-drop, ephemeral).

## File Structure

```
src/modules/demo/<name>/
├── components/
│   ├── <name>-view-page.tsx
│   ├── <name>-board.tsx      (or main interactive component)
│   └── ...
└── utils/
    ├── store.ts              # Zustand store — source of truth
    ├── types.ts              # TypeScript types
    └── data.ts               # Initial mock data (optional, can be inline in store)
```

## Store Pattern

```typescript
// utils/store.ts
import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  body: string;
  status: 'info' | 'warning' | 'error' | 'success';
  createdAt: string;
  read: boolean;
  actions?: { id: string; label: string }[];
}

interface NotificationState {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  addNotification: (notif: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [
    // Initial mock data
  ],
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    ),
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id),
  })),
  addNotification: (notif) => set((state) => ({
    notifications: [
      { ...notif, id: crypto.randomUUID(), createdAt: new Date().toISOString(), read: false },
      ...state.notifications,
    ],
  })),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
```

## When to Use

- **Zustand**: ephemeral client state — chat messages, kanban board, notifications
- **mock-api + React Query**: server-like CRUD data — products, users, dashboards

## Reference Implementation

- `src/modules/demo/chat/` — Zustand + mock conversations
- `src/modules/demo/kanban/` — Zustand + @dnd-kit
- `src/modules/demo/notifications/` — Zustand + notification cards
