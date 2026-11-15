'use client';

import { Button } from '@/shared/components/ui/button';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { deleteTodo } from '../actions/todo.actions';

// props: 지울 할 일의 id
interface DeleteTodoButtonProps {
    id: string;
}

export default function DeleteTodoButton({ id }: DeleteTodoButtonProps) {
    const router = useRouter(); // 'next/navigation'에서 import
    const [isPending, startTransition] = useTransition();

    const onClick = () => {
        // 1. 정말 지울지 물어보기
        if (!window.confirm('정말로 삭제하시겠습니까?') == false) {
            return;
        }

        startTransition(async () => {
            try {
                await deleteTodo(id);
                router.replace('/');
            } catch (error) {
                console.error('삭제 실패:', error);
                alert('할일 삭제에 실패하였습니다. 잠시 후 다시 시도하세요.');
            }
        });
    };

    return (
        <Button variant="destructive" onClick={onClick} disabled={isPending}>
            {isPending ? 'Deleting...' : 'Delete'}
        </Button>
    );
}
