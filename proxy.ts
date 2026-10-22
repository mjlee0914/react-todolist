import { updateSupabaseSession } from '@/shared/lib/supabase-proxy';
import type { NextRequest } from 'next/server';

// Next.js가 페이지 요청 전에 자동으로 실행하는 진입 함수예요.
export async function proxy(request: NextRequest) {
    // 아래 파일에 있는 Supabase 쿠키 확인 작업을 요청과 함께 실행해요.
    return updateSupabaseSession(request);
}

export const config = {
    matcher: [
        // 정적 파일 일부는 건너뛰고, 그 외 요청에서 실행해요.
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
