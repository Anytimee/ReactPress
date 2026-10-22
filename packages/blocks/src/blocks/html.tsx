import { registerBlock } from '../registry.js';
import { Field, TextArea } from './controls.js';
import { sanitizeHtml } from './utils.js';

export interface HtmlAttrs extends Record<string, unknown> {
  html: string;
}

export const htmlBlock = registerBlock<HtmlAttrs>({
  type: 'core/html',
  name: 'HTML',
  category: 'advanced',
  icon: 'Code',
  canHaveChildren: false,
  maxDepth: 0,
  defaultAttrs: { html: '' },
  Save: ({ attrs }) => {
    const clean = sanitizeHtml(attrs.html);
    if (!clean) return null;
    return <div className="rp-html" dangerouslySetInnerHTML={{ __html: clean }} />;
  },
  Edit: ({ attrs, onChange }) => (
    <textarea
      value={attrs.html}
      onChange={(event) => onChange({ ...attrs, html: event.target.value })}
      rows={4}
      spellCheck={false}
      placeholder="<p>HTML Allowed</p>"
      className="w-full resize-y rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] p-2 font-[var(--mono)] text-[12px] text-[var(--ink)] outline-none focus-visible:outline focus-visible:outline-[var(--focus-outline)] focus-visible:outline-offset-[var(--focus-outline)]"
    />
  ),
  Inspector: ({ attrs, onChange }) => (
    <Field label="HTML" hint="Script dan event handler dibuang otomatis saat disimpan.">
      <TextArea
        value={attrs.html}
        rows={8}
        onChange={(event) => onChange({ html: event.target.value })}
        className="font-[var(--mono)]"
      />
    </Field>
  ),
});
