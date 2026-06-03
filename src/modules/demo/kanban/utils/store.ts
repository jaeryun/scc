import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
// import { persist } from 'zustand/middleware';

export type Priority = 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  title: string;
  priority: Priority;
  description?: string;
  assignee?: string;
  dueDate?: string;
};

type KanbanState = {
  columns: Record<string, Task[]>;
  setColumns: (columns: Record<string, Task[]>) => void;
  addTask: (title: string, description?: string) => void;
};

const initialColumns: Record<string, Task[]> = {
  backlog: [
    {
      id: '1',
      title: 'Stripe 결제 API 마이그레이션',
      priority: 'high',
      assignee: '김민지',
      dueDate: '2026-04-08'
    },
    {
      id: '2',
      title: '리포트 CSV 내보내기 추가',
      priority: 'medium',
      assignee: '박준호',
      dueDate: '2026-04-12'
    },
    {
      id: '3',
      title: '온보딩 플로우 문구 수정',
      priority: 'low',
      assignee: '최서연',
      dueDate: '2026-04-15'
    },
    {
      id: '9',
      title: 'RBAC 권한 감사',
      priority: 'medium',
      assignee: '정도윤',
      dueDate: '2026-04-10'
    }
  ],
  inProgress: [
    {
      id: '4',
      title: '알림 서비스 리팩토링',
      priority: 'high',
      assignee: '이지훈',
      dueDate: '2026-04-03'
    },
    {
      id: '5',
      title: '팀 초대 플로우 구축',
      priority: 'medium',
      assignee: '윤하은',
      dueDate: '2026-04-06'
    },
    {
      id: '10',
      title: '스케줄러 타임존 처리 수정',
      priority: 'high',
      assignee: '김민지',
      dueDate: '2026-04-04'
    }
  ],
  done: [
    {
      id: '6',
      title: 'Okta SSO 연동',
      priority: 'high',
      assignee: '정도윤',
      dueDate: '2026-03-22'
    },
    {
      id: '7',
      title: '대시보드 분석 차트',
      priority: 'medium',
      assignee: '박준호',
      dueDate: '2026-03-20'
    },
    {
      id: '8',
      title: '웹훅 재시도 메커니즘',
      priority: 'low',
      assignee: '이지훈',
      dueDate: '2026-03-18'
    }
  ]
};

export const useTaskStore = create<KanbanState>()(
  // To enable persistence across refreshes, uncomment the persist wrapper below:
  // persist(
  (set) => ({
    columns: initialColumns,

    setColumns: (columns) => set({ columns }),

    addTask: (title, description) =>
      set((state) => ({
        columns: {
          ...state.columns,
          backlog: [
            {
              id: uuid(),
              title,
              description,
              priority: 'medium' as Priority,
              assignee: undefined,
              dueDate: undefined
            },
            ...(state.columns.backlog ?? [])
          ]
        }
      }))
  })
  //   ,
  //   { name: 'kanban-store' }
  // )
);
