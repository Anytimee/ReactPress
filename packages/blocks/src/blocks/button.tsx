import { registerBlock } from '../registry.js';
import { Field, OptionSelect, TextInput } from './controls.js';
import { safeUrl } from './utils.js';

export interface ButtonAttrs extends Record<string, unknown> {
  text: string;
  url: string;
  variant: 'default' | 'primary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
}

const BUTTON_VARIANTS: Record<ButtonAttrs['variant'], string> = {
  default:
    'border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--bg)]',
  primary: 'border border-[var(--ink)] bg-[var(--ink)] text-[var(--surface)] hover:bg-[var(--ink-2)]',
  ghost: 'border border-transparent bg-transparent text-[var(--ink)] hover:bg-[var(--bg)]',
};

const BUTTON_SIZES: Record<ButtonAttrs['size'], string> = {
  sm: 'h-8 px-3 text-[12px]',
  md: 'h-9 px-4 text-[13px]',
  lg: 'h-10 px-5 text-[14px]',
};

export const buttonBlock = registerBlock<ButtonAttrs>({
  type: 'core/button',
  name: 'Tombol',
  category: 'text',
  icon: 'MousePointerClick',
  canHaveChildren: false,
  maxDepth: 0,
  defaultAttrs: { text: 'Klik di sini', url: '/', variant: 'default', size: 'md' },
  Save: ({ attrs }) => {
    const href = safeUrl(attrs.url) || '#';
    return (
      <a
        href={href}
        className={`rp-button inline-flex items-center justify-center rounded-[var(--radius-sm)] font-medium transition-colors ${BUTTON_VARIANTS[attrs.variant]} ${BUTTON_SIZES[attrs.size]}`}
      >
        {attrs.text}
      </a>
    );
  },
  Edit: ({ attrs, onChange }) => (
    <div className="flex flex-col gap-2">
      <input
        value={attrs.text}
        onChange={(event) => onChange({ ...attrs, text: event.target.value })}
        placeholder="Label tombol"
        className="w-full bg-transparent text-[15px] font-medium text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
      />
      <input
        value={attrs.url}
        onChange={(event) => onChange({ ...attrs, url: event.target.value })}
        placeholder="/tautan-atau-url"
        className="w-full bg-transparent text-[12px] text-[var(--muted)] outline-none placeholder:text-[var(--muted)]"
      />
    </div>
  ),
  Inspector: ({ attrs, onChange }) => (
    <>
      <Field label="Label">
        <TextInput
          value={attrs.text}
          onChange={(event) => onChange({ text: event.target.value })}
        />
      </Field>
      <Field label="URL">
        <TextInput
          value={attrs.url}
          onChange={(event) => onChange({ url: event.target.value })}
        />
      </Field>
      <Field label="Varian">
        <OptionSelect
          value={attrs.variant}
          onChange={(variant) => onChange({ variant: variant as ButtonAttrs['variant'] })}
          options={['default', 'primary', 'ghost']}
        />
      </Field>
      <Field label="Ukuran">
        <OptionSelect
          value={attrs.size}
          onChange={(size) => onChange({ size: size as ButtonAttrs['size'] })}
          options={['sm', 'md', 'lg']}
        />
      </Field>
    </>
  ),
});
