import type { Todo } from '../types/todo.types';
import { TODO_STATUS_MAP } from '../constants/todoStatus';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import TodoContentViewer from './TodoContentViewer';
import DeleteTodoButton from './DeleteTodoButton';

type TodoProps = {
    todo: Todo;
};

export default function TodoDetail({ todo }: TodoProps): React.JSX.Element {
    const { id, title, status, userName, content, createdAt } = todo;
    return (
        <div className="todo-detail">
            <div className="detail-icon">📌</div>
            <p className="detail-kicker">{TODO_STATUS_MAP[status]} · by {userName}</p>
            <h1>{title}</h1>
            <div className="detail-content">
                <TodoContentViewer content={content} />
            </div>
            {createdAt && (
                <p className="detail-date">Created {new Date(createdAt).toLocaleString('ko-KR')}</p>
            )}
            <div className="detail-actions">
                <Link href={`/`}>
                    <Button variant="outline">← List</Button>
                </Link>
                <Link href={`/todo/${id}/edit`}>
                    <Button>Edit</Button>
                </Link>
                <DeleteTodoButton id={id} />
            </div>
        </div>
    );
}
