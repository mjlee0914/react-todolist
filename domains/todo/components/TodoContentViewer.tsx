'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface TodoContentViewerProps {
    content: string;
}

export default function TodoContentViewer({
    content,
}: TodoContentViewerProps): React.JSX.Element | null {
    const editor = useEditor(
        {
            extensions: [StarterKit],
            content: content,
            editable: false,
            immediatelyRender: false,
        },
        [content], // ← content가 바뀌면 에디터를 다시 만들어라
    );

    if (!editor) {
        return null;
    }

    return <EditorContent editor={editor} />;
}
