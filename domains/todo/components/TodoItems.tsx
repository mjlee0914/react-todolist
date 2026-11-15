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
            <p className="text-sm text-muted-foreground">
                {EMPTY_MESSAGE[status]}
            </p>
        );
    }

    return (
        <div>
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
        <div className="border rounded-2xl p-4 mb-2">
            <div className="font-medium mb-3">
                <span className="mr-1">[{TODO_STATUS_MAP[status]}]</span>
                <Link href={`/todo/${id}/view`}>{title}</Link>
                {_hasHydrated && (
                    <Button
                        type="button"
                        onClick={() =>
                            isPinned ? removePin(id) : addPin(item)
                        }
                    >
                        {isPinned ? '찜 해제' : '찜하기'}
                    </Button>
                )}
            </div>

            <div className="flex gap-2">
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
