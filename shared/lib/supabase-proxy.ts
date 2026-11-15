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
    const { data } = await supabase.auth.getClaims();
    const isLoggedin = !!data?.claims;
    const { pathname } = request.nextUrl;

    // 이미 로그인한 사용자가 /sign_in 또는 /sign_up 접근 시 메인 홈으로 리다이렉트
    if (
        isLoggedin &&
        (pathname.startsWith('/sign_in') || pathname.startsWith('/sign_up'))
    ) {
        // request.nextUrl은 지금 들어온 요청 그 자체 정보이자 request를 쓰는 코드가 보는 곳
        // 원본 직접 고치면 요청 정보 뒤바뀜 -> 복사본 따로 만들어서 보낼 주소만 따로 고치기
        const homeUrl = request.nextUrl.clone();
        homeUrl.pathname = '/';
        homeUrl.search = '';
        return redirectWithCookies(homeUrl, response);
    } // 비회원이 메인 또는 /todo로 시작하는 페이지에 접속할 경우 /sign_in?redirectUrl=...으로 리다이렉트

    const isProtectedPath = pathname === '/' || pathname.startsWith('/todo');

    if (!isLoggedin && isProtectedPath) {
        const signInUrl = request.nextUrl.clone();
        signInUrl.pathname = '/sign_in';
        signInUrl.searchParams.set('redirectUrl', pathname);
        return redirectWithCookies(signInUrl, response);
    }
    // 쿠키가 반영된 응답을 Next.js에 돌려줘요.
    return response;
}

function redirectWithCookies(url: URL, from: NextResponse): NextResponse {
    const redirectResponse = NextResponse.redirect(url);

    // from에 있는 쿠키를 전부 꺼내서 redirectResponse에 붙이기
    from.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
}
