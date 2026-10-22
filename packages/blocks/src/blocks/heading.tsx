import { registerBlock } from '../registry.js';
import { Field, SelectInput, TextInput } from './controls.js';

export interface HeadingAttrs extends Record<string, unknown> {
  level: number;
  align: 'left' | 'center' | 'right';
  text: string;
}

const LEVELS = [1, 2, 3, 4, 5, 6] as const;

export const headingBlock = registerBlock<HeadingAttrs>({
  type: 'core/heading',
  name: 'Heading',
  category: 'text',
  icon: 'Heading',
  canHaveChildren: false,
  maxDepth: 0,
  defaultAttrs: { level: 2, align: 'left', text: '' },
  Save: ({ attrs }) => {
    const level = LEVELS.includes(attrs.level as (typeof LEVELS)[number]) ? attrs.level : 2;
    const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    return (
      <Tag
        className="rp-heading rp-heading--h2"
        style={{ textAlign: attrs.align === 'left' ? undefined : attrs.align }}
      >
        {attrs.text}
      </Tag>
    );
  },
  Edit: ({ attrs, onChange }) => (
    <input
      value={attrs.text}
      onChange={(event) => onChange({ ...attrs, text: event.target.value })}
      placeholder="Judul bagian"
      className="w-full bg-transparent text-[20px] font-semibold tracking-tight text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
    />
  ),
  Inspector: ({ attrs, onChange }) => (
    <>
      <Field label="Level">
        <SelectInput
          value={String(attrs.level)}
          onChange={(event) => onChange({ level: Number(event.target.value) })}
        >
          {LEVELS.map((level) => (
            <option key={level} value={level}>
              H{level}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Perataan">
        <SelectInput
          value={attrs.align}
          onChange={(event) =>
            onChange({ align: event.target.value as HeadingAttrs['align'] })
          }
        >
          <option value="left">Kiri</option>
          <option value="center">Tengah</option>
          <option value="right">Kanan</option>
        </SelectInput>
      </Field>
      <Field label="Teks">
        <TextInput
          value={attrs.text}
          onChange={(event) => onChange({ text: event.target.value })}
        />
      </Field>
    </>
  ),
});
