import WindowsShell from '@/shared/components/WindowsShell';
import { getCurrentUser } from '@/domains/auth/queries/getCurrentUser.query';
import { connection } from 'next/server';

export const instant = false;
interface TodoLayoutProps {
    children: React.ReactNode;
}
export default async function TodoLayout({
    children,
}: TodoLayoutProps): Promise<React.ReactNode> {
    await connection();
    const { user } = await getCurrentUser();
    return (
        <WindowsShell user={user}>{children}</WindowsShell>
    );
}
