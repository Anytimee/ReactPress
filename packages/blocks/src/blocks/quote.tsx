import { registerBlock } from '../registry.js';
import { Field, TextInput } from './controls.js';

export interface QuoteAttrs extends Record<string, unknown> {
  text: string;
  cite: string;
}

export const quoteBlock = registerBlock<QuoteAttrs>({
  type: 'core/quote',
  name: 'Kutipan',
  category: 'text',
  icon: 'Quote',
  canHaveChildren: false,
  maxDepth: 0,
  defaultAttrs: { text: '', cite: '' },
  Save: ({ attrs }) => (
    <blockquote className="rp-quote">
      <p>{attrs.text}</p>
      {attrs.cite ? <cite>{attrs.cite}</cite> : null}
    </blockquote>
  ),
  Edit: ({ attrs, onChange }) => (
    <div className="flex flex-col gap-1 border-l-2 border-[var(--line)] pl-3">
      <textarea
        value={attrs.text}
        onChange={(event) => onChange({ ...attrs, text: event.target.value })}
        placeholder="Isi kutipan"
        rows={2}
        className="w-full resize-y bg-transparent text-[15px] leading-[1.55] text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
      />
      <input
        value={attrs.cite}
        onChange={(event) => onChange({ ...attrs, cite: event.target.value })}
        placeholder="Sumber (opsional)"
        className="w-full bg-transparent text-[12px] text-[var(--muted)] outline-none placeholder:text-[var(--muted)]"
      />
    </div>
  ),
  Inspector: ({ attrs, onChange }) => (
    <>
      <Field label="Kutipan">
        <TextInput
          value={attrs.text}
          onChange={(event) => onChange({ text: event.target.value })}
        />
      </Field>
      <Field label="Sumber">
        <TextInput
          value={attrs.cite}
          onChange={(event) => onChange({ cite: event.target.value })}
        />
      </Field>
    </>
  ),
});
