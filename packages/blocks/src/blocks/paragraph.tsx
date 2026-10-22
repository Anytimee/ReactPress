import { lazy, Suspense, type ReactElement } from 'react';
import { registerBlock } from '../registry.js';
import { mergeClasses, sanitizeInlineHtml, unwrapSingleParagraph } from './utils.js';

export interface ParagraphAttrs extends Record<string, unknown> {
  html: string;
  text: string;
}

const ParagraphEditor = lazy(() => import('./paragraph-editor.js'));

function ParagraphEdit(props: {
  node: { id: string };
  attrs: ParagraphAttrs;
  onChange: (attrs: ParagraphAttrs) => void;
  selected: boolean;
}): ReactElement {
  return (
    <Suspense
      fallback={
        <p className="min-h-[1.55rem] text-[15px] leading-[1.55] text-[var(--ink)]">
          {props.attrs.text}
        </p>
      }
    >
      <ParagraphEditor
        html={props.attrs.html}
        text={props.attrs.text}
        selected={props.selected}
        onChange={props.onChange}
      />
    </Suspense>
  );
}

export const paragraphBlock = registerBlock<ParagraphAttrs>({
  type: 'core/paragraph',
  name: 'Paragraf',
  category: 'text',
  icon: 'Type',
  canHaveChildren: false,
  maxDepth: 0,
  defaultAttrs: { html: '', text: '' },
  Save: ({ attrs }) => {
    const { html, single } = unwrapSingleParagraph(sanitizeInlineHtml(attrs.html));
    if (single) {
      return <p className="rp-paragraph" dangerouslySetInnerHTML={{ __html: html }} />;
    }
    return <div className="rp-paragraph" dangerouslySetInnerHTML={{ __html: html }} />;
  },
  Edit: ParagraphEdit,
  Inspector: ({ attrs, onChange }) => (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] text-[var(--muted)]">
        Teks: {attrs.text ? attrs.text.slice(0, 80) : '—'}
      </p>
      <button
        type="button"
        className={mergeClasses(
          'self-start text-[11px] text-[var(--muted)] underline underline-offset-2 hover:text-[var(--ink)]',
        )}
        onClick={() => onChange({ ...attrs, html: '', text: '' })}
      >
        Bersihkan isi
      </button>
    </div>
  ),
});
