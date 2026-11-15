import Header from '@/shared/components/Header';
import { Suspense } from 'react';
interface TodoLayoutProps {
    children: React.ReactNode;
}
export default function TodoLayout({
    children,
}: TodoLayoutProps): React.ReactNode {
    return (
        <div className="max-w-2xl w-full mx-auto min-w-xs px-4 ">
            <Suspense
                fallback={
                    <div className="h-14 mb-4 bg-indigo-100 animate-pulse" />
                }
            >
                <Header />
            </Suspense>
            <main>{children}</main>
        </div>
    );
}
