'use client';
import { usePinStore } from '@/domains/todo/stores/usePinStore';
import { useEffect } from 'react';

export default function TodoPinPage() {
    const _hasHydrated = usePinStore((state) => state._hasHydrated);
    const items = usePinStore((state) => state.items);

    useEffect(() => {
        void usePinStore.persist.rehydrate();
    }, []);

    if (!_hasHydrated) {
        return <p className="todo-empty">Pinned list is loading...</p>;
    }

    if (items.length === 0) {
        return <div className="simple-page"><div className="detail-icon">⭐</div><h1>Pinned</h1><p>No pinned todos yet.</p></div>;
    }

    return (
        <div className="simple-page"><div className="detail-icon">⭐</div><h1>Pinned</h1><ul className="pinned-list">
            {items.map(({ id, title }) => (
                <li key={id}>{title}</li>
            ))}
        </ul></div>
    );
}
