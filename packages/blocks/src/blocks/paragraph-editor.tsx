import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef } from 'react';
import type { ParagraphAttrs } from './paragraph.js';

const DEBOUNCE_MS = 300;

export interface ParagraphEditorProps {
  html: string;
  text: string;
  selected: boolean;
  onChange: (attrs: ParagraphAttrs) => void;
}

export default function ParagraphEditor({
  html,
  text,
  selected,
  onChange,
}: ParagraphEditorProps): JSX.Element {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef({ html, text });
  latest.current = { html, text };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        codeBlock: false,
        horizontalRule: false,
        dropcursor: { color: 'var(--ink)' },
      }),
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: 'https' }),
      Placeholder.configure({ placeholder: 'Tulis paragraf…' }),
    ],
    content: html || '<p></p>',
    editorProps: {
      attributes: {
        class:
          'min-h-[1.55rem] text-[15px] leading-[1.55] text-[var(--ink)] outline-none ' +
          'placeholder:text-[var(--muted)]',
        'data-placeholder': 'Tulis paragraf…',
      },
    },
    onUpdate: ({ editor: instance }) => {
      const nextHtml = instance.getHTML();
      const nextText = instance.getText();
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        onChange({ html: nextHtml, text: nextText });
      }, DEBOUNCE_MS);
    },
  });

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (currentHtml === html) return;
    if (html === '' && currentHtml === '<p></p>') return;
    editor.commands.setContent(html || '<p></p>', false);
  }, [editor, html]);

  if (!editor) {
    return <p className="min-h-[1.55rem] text-[15px] leading-[1.55] text-[var(--ink)]">{text}</p>;
  }

  return (
    <div className={selected ? 'rp-editor-selected' : undefined}>
      <EditorContent editor={editor} />
    </div>
  );
}
