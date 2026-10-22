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
        return <p>찜 목록 불러오는 중...</p>;
    }

    if (items.length === 0) {
        return <p>찜한 할 일이 없습니다.</p>;
    }

    return (
        <ul>
            {items.map(({ id, title }) => (
                <li key={id}>{title}</li>
            ))}
        </ul>
    );
}
