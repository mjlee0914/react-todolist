'use client'; // 에러 화면은 반드시 클라이언트 컴포넌트

import { useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';

interface ErrorProps {
    error: unknown; // 던진 값 (Error가 아닐 수도 있어서 unknown)
    retry: () => void; // 누르면 페이지를 다시 시도
}

export default function TodoError({ error, retry }: ErrorProps) {
    useEffect(() => {
        console.error(error);
    }, [error]); // 2. 의존성 배열: 에러가 바뀌면 다시 로그를 찍음

    return (
        <div>
            <h1>할 일을 불러오지 못했습니다.</h1>
            <p>잠시 후 다시 시도해 주세요.</p>
            <Button onClick={retry}>다시 시도하기</Button>
        </div>
    );
}
