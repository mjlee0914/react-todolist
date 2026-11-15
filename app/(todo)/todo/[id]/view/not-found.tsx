import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';

export default function TodoNotFound(): React.JSX.Element {
    return (
        <div>
            <h1>할 일을 찾을 수 없습니다.</h1>
            <p>할 일이 삭제되었거나 권한이 없습니다.</p>
            <Link href={`/`}>
                <Button>목록으로 돌아가기</Button>
            </Link>
        </div>
    );
}
