import type { Todo } from '../types/todo.types';
import { TODO_STATUS_MAP } from '../constants/todoStatus';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import TodoContentViewer from './TodoContentViewer';

type TodoProps = {
    todo: Todo;
};

export default function TodoDetail({ todo }: TodoProps): React.JSX.Element {
    const { title, status, userName, content, createdAt } = todo;
    return (
        <div>
            <p>작성자: {userName}</p>
            <p className="mr-1">상태: [{TODO_STATUS_MAP[status]}]</p>
            <h1>제목: {title}</h1>
            <div>
                내용: <TodoContentViewer content={content} />
            </div>
            {createdAt && (
                <p>작성일: {new Date(createdAt).toLocaleString('ko-KR')}</p>
            )}
            <Link href={`/`}>
                <Button>목록으로 돌아가기</Button>
            </Link>
        </div>
    );
}
