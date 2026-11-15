'use client';

import type { UserProfile } from '@/domains/auth/types/auth.types';
import SignOutButton from '@/domains/auth/components/SignOutButton';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FiUser } from 'react-icons/fi';

interface WindowsShellProps {
    user: UserProfile | null;
    children: React.ReactNode;
}

type DesktopIconId = 'todo' | 'pinned';

interface IconPosition {
    x: number;
    y: number;
}

export default function WindowsShell({ user, children }: WindowsShellProps) {
    const pathname = usePathname();
    const router = useRouter();
    const isAuthRoute = pathname === '/sign_in' || pathname === '/sign_up';
    const [booting, setBooting] = useState(true);
    const [todoOpen, setTodoOpen] = useState(pathname !== '/');
    const [startOpen, setStartOpen] = useState(false);
    const [iconPositions, setIconPositions] = useState<
        Record<DesktopIconId, IconPosition>
    >({
        todo: { x: 28, y: 28 },
        pinned: { x: 28, y: 130 },
    });
    const dragRef = useRef<{
        id: DesktopIconId;
        pointerId: number;
        element: HTMLElement;
        startX: number;
        startY: number;
        originX: number;
        originY: number;
        nextX: number;
        nextY: number;
        frameId: number | null;
        moved: boolean;
    } | null>(null);
    const selectionRef = useRef<{
        pointerId: number;
        startX: number;
        startY: number;
    } | null>(null);
    const selectionBoxRef = useRef<HTMLDivElement>(null);
    const suppressClickUntilRef = useRef(0);

    useEffect(() => {
        const timer = window.setTimeout(() => setBooting(false), 1700);
        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!booting && !user && pathname === '/') router.replace('/sign_in');
    }, [booting, pathname, router, user]);

    useEffect(() => {
        if (!booting && user && isAuthRoute) window.location.replace('/');
    }, [booting, isAuthRoute, user]);

    if (booting) {
        return (
            <main className="xp-boot" aria-label="Todo List 시작 중">
                <div className="boot-bubbles" />
                <div className="boot-logo" aria-hidden="true">🐠</div>
                <h1>fruity todo</h1>
                <p>your tiny tasks are waking up...</p>
                <div className="xp-loader"><span /></div>
                <small>Microsoft Windows inspired · made with bubbles</small>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="xp-login-screen">
                <section className="login-brand">
                    <div className="login-fish" aria-hidden="true">🐟</div>
                    <h1>fruity todo</h1>
                    <p>To begin, click your account</p>
                </section>
                <section className="login-panel">
                    <div className="login-card">
                        <div className="login-avatar" aria-hidden="true">🐡</div>
                        <div className="login-form-area">{children}</div>
                    </div>
                    <nav className="auth-switch">
                        {pathname === '/sign_up' ? (
                            <Link href="/sign_in">← Back to log in</Link>
                        ) : (
                            <Link href="/sign_up">Create a new account</Link>
                        )}
                    </nav>
                </section>
                <footer className="login-footer">
                    <span className="power-dot">⏻</span>
                    <span>You can turn off the computer after saving your todos.</span>
                </footer>
            </main>
        );
    }

    const isHome = pathname === '/';
    const isWindowOpen = isAuthRoute ? false : !isHome || todoOpen;
    const closeWindow = () => {
        if (!isHome) router.push('/');
        setTodoOpen(false);
    };

    const onIconPointerDown = (
        event: React.PointerEvent<HTMLElement>,
        id: DesktopIconId,
    ) => {
        if (event.button !== 0) return;
        const position = iconPositions[id];
        dragRef.current = {
            id,
            pointerId: event.pointerId,
            element: event.currentTarget,
            startX: event.clientX,
            startY: event.clientY,
            originX: position.x,
            originY: position.y,
            nextX: position.x,
            nextY: position.y,
            frameId: null,
            moved: false,
        };
        event.currentTarget.classList.add('dragging');
        event.currentTarget.closest('.xp-desktop')?.classList.add('interaction-active');
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const onIconPointerMove = (event: React.PointerEvent<HTMLElement>) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;

        const deltaX = event.clientX - drag.startX;
        const deltaY = event.clientY - drag.startY;
        if (Math.abs(deltaX) + Math.abs(deltaY) > 5) drag.moved = true;

        const maxX = Math.max(0, window.innerWidth - 94);
        const maxY = Math.max(0, window.innerHeight - 136);
        drag.nextX = Math.min(maxX, Math.max(0, drag.originX + deltaX));
        drag.nextY = Math.min(maxY, Math.max(0, drag.originY + deltaY));

        if (drag.frameId === null) {
            drag.frameId = window.requestAnimationFrame(() => {
                const activeDrag = dragRef.current;
                if (!activeDrag) return;
                activeDrag.element.style.transform = `translate3d(${activeDrag.nextX}px, ${activeDrag.nextY}px, 0)`;
                activeDrag.frameId = null;
            });
        }
    };

    const onIconPointerUp = (event: React.PointerEvent<HTMLElement>) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        if (drag.frameId !== null) window.cancelAnimationFrame(drag.frameId);
        drag.element.style.transform = `translate3d(${drag.nextX}px, ${drag.nextY}px, 0)`;
        drag.element.classList.remove('dragging');
        drag.element.closest('.xp-desktop')?.classList.remove('interaction-active');
        setIconPositions((positions) => ({
            ...positions,
            [drag.id]: { x: drag.nextX, y: drag.nextY },
        }));
        if (drag.moved) suppressClickUntilRef.current = performance.now() + 350;
        dragRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    const onDesktopPointerDown = (event: React.PointerEvent<HTMLElement>) => {
        if (event.button !== 0 || event.target !== event.currentTarget) return;
        selectionRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
        };
        event.currentTarget.classList.add('interaction-active');
        const box = selectionBoxRef.current;
        if (box) {
            box.style.display = 'block';
            box.style.left = `${event.clientX}px`;
            box.style.top = `${event.clientY}px`;
            box.style.width = '0px';
            box.style.height = '0px';
        }
        event.currentTarget.setPointerCapture(event.pointerId);
        event.preventDefault();
    };

    const onDesktopPointerMove = (event: React.PointerEvent<HTMLElement>) => {
        const selection = selectionRef.current;
        const box = selectionBoxRef.current;
        if (!selection || !box || selection.pointerId !== event.pointerId) return;

        box.style.left = `${Math.min(selection.startX, event.clientX)}px`;
        box.style.top = `${Math.min(selection.startY, event.clientY)}px`;
        box.style.width = `${Math.abs(event.clientX - selection.startX)}px`;
        box.style.height = `${Math.abs(event.clientY - selection.startY)}px`;
    };

    const onDesktopPointerUp = (event: React.PointerEvent<HTMLElement>) => {
        const selection = selectionRef.current;
        if (!selection || selection.pointerId !== event.pointerId) return;
        selectionRef.current = null;
        event.currentTarget.classList.remove('interaction-active');
        if (selectionBoxRef.current) selectionBoxRef.current.style.display = 'none';
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    const consumeDraggedClick = () => {
        return performance.now() < suppressClickUntilRef.current;
    };

    return (
        <main
            className="xp-desktop"
            onPointerDown={onDesktopPointerDown}
            onPointerMove={onDesktopPointerMove}
            onPointerUp={onDesktopPointerUp}
            onPointerCancel={onDesktopPointerUp}
        >
            <div ref={selectionBoxRef} className="desktop-selection" aria-hidden="true" />
            <div className="desktop-sun" />
            <div className="desktop-cloud cloud-one" />
            <div className="desktop-cloud cloud-two" />
            <div className="desktop-hills" />
            <div className="swimming-fish" aria-hidden="true">
                <img className="swimmer swimmer-one" src="/swimming-goldfish.png" alt="" />
                <img className="swimmer swimmer-two" src="/fish-blue-tang.png" alt="" />
                <img className="swimmer swimmer-three" src="/fish-angelfish.png" alt="" />
                <img className="swimmer swimmer-four" src="/fish-striped.png" alt="" />
                <img className="swimmer swimmer-five" src="/fish-blue-tang.png" alt="" />
                <img className="swimmer swimmer-six" src="/fish-koi.png" alt="" />
                <img className="swimmer swimmer-seven" src="/fish-discus.png" alt="" />
            </div>

            <button
                className="desktop-icon"
                style={{ transform: `translate3d(${iconPositions.todo.x}px, ${iconPositions.todo.y}px, 0)` }}
                onPointerDown={(event) => onIconPointerDown(event, 'todo')}
                onPointerMove={onIconPointerMove}
                onPointerUp={onIconPointerUp}
                onPointerCancel={onIconPointerUp}
                onClick={(event) => {
                    if (consumeDraggedClick()) {
                        event.preventDefault();
                        event.stopPropagation();
                        return;
                    }
                    setTodoOpen(true);
                }}
            >
                <img className="desktop-icon-image" src="/todo-list-icon.png" alt="" />
                <span>Todo List</span>
            </button>
            <Link
                className="desktop-icon pinned-icon"
                href="/todo/pin"
                style={{ transform: `translate3d(${iconPositions.pinned.x}px, ${iconPositions.pinned.y}px, 0)` }}
                onPointerDown={(event) => onIconPointerDown(event, 'pinned')}
                onPointerMove={onIconPointerMove}
                onPointerUp={onIconPointerUp}
                onPointerCancel={onIconPointerUp}
                onClick={(event) => {
                    if (consumeDraggedClick()) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }}
            >
                <img className="desktop-icon-image" src="/pinned-icon.png" alt="" />
                <span>Pinned</span>
            </Link>

            {isWindowOpen && (
                <section className="xp-window" aria-label="Todo List application">
                    <header className="xp-titlebar">
                        <div className="xp-title"><span>🐠</span> Todo List</div>
                        <div className="window-controls" aria-label="창 제어">
                            <button type="button" aria-label="최소화" onClick={() => setTodoOpen(false)}>_</button>
                            <button type="button" aria-label="최대화">□</button>
                            <button type="button" className="close" aria-label="닫기" onClick={closeWindow}>×</button>
                        </div>
                    </header>
                    <div className="xp-menubar"><span>File</span><span>Edit</span><span>View</span><span>Favorites</span><span>Help</span></div>
                    <div className="xp-toolbar">
                        <Link href="/" className="toolbar-brand">🐚 <strong>My Todo List</strong></Link>
                        <span className="toolbar-user"><FiUser /> {user.name}</span>
                    </div>
                    <div className="xp-window-content">{children}</div>
                    <footer className="xp-statusbar"><span>Ready</span><span>🐟 Keep swimming!</span></footer>
                </section>
            )}

            {startOpen && (
                <>
                    <button className="start-menu-backdrop" type="button" aria-label="시작 메뉴 닫기" onClick={() => setStartOpen(false)} />
                    <section className="start-menu" aria-label="프로젝트 소개">
                        <header className="start-menu-header">
                            <img src="/goldfish-favicon-source.png" alt="" />
                            <div><strong>Fruity Todo</strong><span>My little task desktop</span></div>
                        </header>
                        <div className="start-menu-body">
                            <p className="start-eyebrow">ABOUT THIS PROJECT</p>
                            <h2>할 일을 귀엽고 즐겁게.</h2>
                            <p>Windows XP와 Frutiger Aero의 낭만을 담은 개인 Todo List입니다. 할 일을 기록하고, 진행 상태를 바꾸고, 중요한 항목을 따로 모아볼 수 있어요.</p>
                            <div className="project-features">
                                <span>✓ 할 일 등록·수정·삭제</span>
                                <span>✓ Ready · Progress · Done</span>
                                <span>✓ Pinned 목록</span>
                                <span>✓ Supabase 로그인</span>
                            </div>
                            <div className="project-stack"><span>Next.js</span><span>React</span><span>TypeScript</span><span>Supabase</span></div>
                        </div>
                        <footer className="start-menu-footer">🐠 Keep swimming, one task at a time.</footer>
                    </section>
                </>
            )}

            <footer className="xp-taskbar">
                <button className={`start-button ${startOpen ? 'active' : ''}`} type="button" aria-expanded={startOpen} onClick={() => setStartOpen((open) => !open)}><span>✿</span> start</button>
                {isWindowOpen && <button className="task-button" type="button" onClick={() => setTodoOpen(true)}>🐠 Todo List</button>}
                <div className="taskbar-tray"><span>🔊</span><span>🫧</span><span>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span><SignOutButton /></div>
            </footer>
        </main>
    );
}
