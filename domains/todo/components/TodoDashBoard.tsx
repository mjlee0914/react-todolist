'use client';

import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import { useEffect, useOptimistic, useTransition } from 'react';
import { changeTodoStatus } from '../actions/todo.actions';
import { usePinStore } from '../stores/usePinStore';
import type { Todo, TodoStatus } from '../types/todo.types';
import TodoItems from './TodoItems';

interface TodoDashBoardProps {
    initialItems: Todo[];
}

interface OptimisticUpdateType {
    id: string;
    nextStatus: TodoStatus;
}

export default function TodoDashBoard({
    initialItems,
}: TodoDashBoardProps): React.JSX.Element {
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        void usePinStore.persist.rehydrate();
    }, []);

    // 낙관적 상태 관리 훅
    const [optimisticItems, setOptimisticItems] = useOptimistic(
        initialItems,
        (currentItems, { id, nextStatus }: OptimisticUpdateType) =>
            currentItems.map((item) =>
                item.id === id ? { ...item, status: nextStatus } : item,
            ),
    );

    const onClick = (id: string, status: TodoStatus) => {
        // 이미 동일한 상태인 경우 불필요한 요청 방지
        const currentItem = initialItems.find((item) => item.id === id);
        if (currentItem && currentItem.status === status) {
            return;
        }

        startTransition(async () => {
            // UI 즉시 반영(낙관적 상태로 선반영)
            setOptimisticItems({ id, nextStatus: status });
            try {
                // 서버에 상태 반영
                await changeTodoStatus(id, status);
            } catch (error) {
                // 실패 시 startTransition이 종료 되면서 자동으로 initialItems(서버 값)로 롤백됨
                console.error('상태 변경 실패:', error);
                alert(
                    '할일 상태 변경에 실패하였습니다. 잠시 후 다시 시도하세요.',
                );
            }
        });
    };

    return (
        <>
            <div className="todo-actions">
                <Link href="/todo/pin">
                    <Button>★ Pinned</Button>
                </Link>
                <Link href="/todo/new">
                    <Button>＋ New Todo</Button>
                </Link>
            </div>
            {/* 백그라운드 동기화 상태 표시 */}
            {isPending && (
                <span className="text-sm text-muted-foreground animate-pulse">
                    서버와 동기화 중...
                </span>
            )}
            <div className="todo-column ready-column">
                <h2>
                    <span>☁</span> Ready
                </h2>
                <TodoItems
                    status="READY"
                    items={optimisticItems}
                    onClick={onClick}
                />
            </div>
            <div className="todo-column progress-column">
                <h2>
                    <span>🐟</span> In progress
                </h2>
                <TodoItems
                    status="PROGRESS"
                    items={optimisticItems}
                    onClick={onClick}
                />
            </div>
            <div className="todo-column done-column">
                <h2>
                    <span>✿</span> Done
                </h2>
                <TodoItems
                    status="DONE"
                    items={optimisticItems}
                    onClick={onClick}
                />
            </div>
        </>
    );
}
