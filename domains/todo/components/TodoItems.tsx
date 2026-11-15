'use client';

import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import type { Todo, TodoStatus } from '../types/todo.types';
import { TODO_STATUS_MAP } from '../constants/todoStatus';
import { usePinStore } from '../stores/usePinStore';

interface TodoItemsProps {
    status: TodoStatus;
    items?: Todo[];
    onClick: (id: string, status: TodoStatus) => void;
}

type TodoItemProps = {
    item: Todo;
    onClick: (id: string, status: TodoStatus) => void;
};

const EMPTY_MESSAGE: Record<TodoStatus, string> = {
    READY: '준비중인 할 일이 없습니다.',
    PROGRESS: '진행중인 할 일이 없습니다.',
    DONE: '완료된 할 일이 없습니다.',
};

export default function TodoItems({
    status,
    items = [],
    onClick,
}: TodoItemsProps) {
    const filteredItems = items.filter((item) => item.status === status);

    if (filteredItems.length === 0) {
        return (
            <p className="todo-empty">
                {EMPTY_MESSAGE[status]}
            </p>
        );
    }

    return (
        <div className="todo-items">
            {filteredItems.map((item) => (
                <TodoItem key={item.id} item={item} onClick={onClick} />
            ))}
        </div>
    );
}

function TodoItem({ item, onClick }: TodoItemProps) {
    const { id, status, title } = item;

    const _hasHydrated = usePinStore((state) => state._hasHydrated);
    const addPin = usePinStore((state) => state.add);
    const removePin = usePinStore((state) => state.remove);
    const isPinned = usePinStore((state) =>
        state.items.some((item) => item.id === id),
    );

    const statusEntries = Object.entries(TODO_STATUS_MAP) as [
        TodoStatus,
        string,
    ][];

    return (
        <div className="todo-item">
            <div className="todo-item-heading">
                <span className="status-dot" aria-hidden="true" />
                <Link href={`/todo/${id}/view`}>{title}</Link>
                {_hasHydrated && (
                    <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() =>
                            isPinned ? removePin(id) : addPin(item)
                        }
                    >
                        {isPinned ? '★ Unpin' : '☆ Pin'}
                    </Button>
                )}
            </div>

            <div className="status-buttons">
                {statusEntries.map(([s, label]) => {
                    const isCurrentStatus = s === status;
                    return (
                        <Button
                            key={`${id}_${s}`}
                            size="sm"
                            variant={isCurrentStatus ? 'default' : 'outline'}
                            disabled={isCurrentStatus}
                            onClick={() => onClick(id, s)}
                        >
                            {label}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
