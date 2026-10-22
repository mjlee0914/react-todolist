import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// 브라우저 요청에 들어 있는 Supabase 로그인 쿠키를 확인하고 갱신해요.
export async function updateSupabaseSession(request: NextRequest) {
    // 우선 요청을 다음 페이지로 그대로 보내는 응답을 준비해요.
    let response = NextResponse.next({ request });

    // 이 요청의 쿠키를 읽고, 필요하면 새 쿠키를 쓸 Supabase 클라이언트를 만들어요.
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                // 브라우저가 이번 요청과 함께 보낸 쿠키를 Supabase에 전달해요.
                getAll() {
                    return request.cookies.getAll();
                },
                // Supabase가 로그인 쿠키를 새로 만들거나 갱신할 때 호출돼요.
                setAll(cookiesToSet, headers) {
                    // 현재 요청에서도 새 쿠키를 사용할 수 있게 바꿔요.
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value);
                    });

                    // 바뀐 요청 정보를 담아 페이지로 보낼 응답을 다시 만들어요.
                    response = NextResponse.next({ request });

                    // 브라우저에도 새 쿠키를 저장하도록 응답에 실어요.
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options);
                    });

                    // Supabase가 함께 준 응답 헤더도 브라우저로 전달해요.
                    Object.entries(headers).forEach(([name, value]) => {
                        response.headers.set(name, value);
                    });
                },
            },
        },
    );

    // 로그인 토큰을 확인해요. 갱신이 필요하면 위 setAll이 새 쿠키를 처리해요.
    await supabase.auth.getClaims();

    // 쿠키가 반영된 응답을 Next.js에 돌려줘요.
    return response;
}
