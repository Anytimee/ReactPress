import { registerBlock } from '../registry.js';
import { Field, OptionSelect, TextInput } from './controls.js';

export interface GroupAttrs extends Record<string, unknown> {
  layout: 'stack' | 'flex';
  gap: number;
  padding: number;
  bg: string;
  radius: number;
}

const BACKGROUNDS = ['transparent', 'surface', 'bg', 'ink'] as const;

const BACKGROUND_VALUES: Record<GroupAttrs['bg'], string> = {
  transparent: 'transparent',
  surface: 'var(--surface)',
  bg: 'var(--bg)',
  ink: 'var(--ink)',
};

export const groupBlock = registerBlock<GroupAttrs>({
  type: 'core/group',
  name: 'Grup',
  category: 'layout',
  icon: 'Group',
  canHaveChildren: true,
  maxDepth: 0,
  defaultAttrs: { layout: 'stack', gap: 16, padding: 16, bg: 'transparent', radius: 0 },
  Save: ({ attrs, renderChildren }) => (
    <div
      className="rp-group"
      style={{
        display: attrs.layout === 'flex' ? 'flex' : 'flex',
        flexDirection: attrs.layout === 'stack' ? 'column' : 'row',
        flexWrap: attrs.layout === 'flex' ? 'wrap' : 'nowrap',
        gap: `${attrs.gap}px`,
        padding: `${attrs.padding}px`,
        background: BACKGROUND_VALUES[attrs.bg] ?? 'transparent',
        borderRadius: `${attrs.radius}px`,
      }}
    >
      {renderChildren ? renderChildren() : null}
    </div>
  ),
  Edit: ({ attrs, renderChildren }) => (
    <div
      className="flex h-[60px] items-center justify-center rounded-[var(--radius-sm)] border border-dashed border-[var(--line)] text-[11px] text-[var(--muted)]"
      style={{ gap: `${attrs.gap}px` }}
    >
      Grup
      {renderChildren ? renderChildren() : null}
    </div>
  ),
  Inspector: ({ attrs, onChange }) => (
    <>
      <Field label="Layout">
        <OptionSelect
          value={attrs.layout}
          onChange={(layout) => onChange({ layout: layout as GroupAttrs['layout'] })}
          options={['stack', 'flex']}
        />
      </Field>
      <Field label="Jarak (px)">
        <TextInput
          type="number"
          min={0}
          max={96}
          step={4}
          value={String(attrs.gap)}
          onChange={(event) => onChange({ gap: Number(event.target.value) })}
        />
      </Field>
      <Field label="Padding (px)">
        <TextInput
          type="number"
          min={0}
          max={96}
          step={4}
          value={String(attrs.padding)}
          onChange={(event) => onChange({ padding: Number(event.target.value) })}
        />
      </Field>
      <Field label="Latar">
        <OptionSelect
          value={attrs.bg}
          onChange={(bg) => onChange({ bg: bg as GroupAttrs['bg'] })}
          options={BACKGROUNDS}
        />
      </Field>
      <Field label="Radius (px)">
        <TextInput
          type="number"
          min={0}
          max={24}
          value={String(attrs.radius)}
          onChange={(event) => onChange({ radius: Number(event.target.value) })}
        />
      </Field>
    </>
  ),
});
