import { getTodoById } from '@/domains/todo/queries/getTodoById.query';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TodoDetail from '@/domains/todo/components/TodoDetail';
export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const todo = await getTodoById(id);

    return {
        title: todo?.title ?? 'TODO APP',
        description: todo?.content ?? '',
    };
}

export default async function TodoViewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
    const { id } = await params;
    const todo = await getTodoById(id);

    if (!todo) {
        notFound();
    }

    return <TodoDetail todo={todo} />;
}
