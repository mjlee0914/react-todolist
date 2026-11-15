import type { TodoStatus } from '../types/todo.types';

export const TODO_STATUS_MAP: Record<TodoStatus, string> = {
    READY: '준비중',
    PROGRESS: '진행중',
    DONE: '완료',
} as const;
