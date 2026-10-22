import { registerBlock } from '../registry.js';
import { Field, TextInput, Toggle } from './controls.js';

export interface ColumnAttrs extends Record<string, unknown> {
  width: number;
}

export const columnBlock = registerBlock<ColumnAttrs>({
  type: 'core/column',
  name: 'Kolom',
  category: 'layout',
  icon: 'Columns2',
  canHaveChildren: true,
  maxDepth: 0,
  defaultAttrs: { width: 50 },
  Save: ({ attrs, renderChildren }) => (
    <div className="rp-column" style={{ flex: `${attrs.width} 1 0%` }}>
      {renderChildren ? renderChildren() : null}
    </div>
  ),
  Edit: ({ attrs, renderChildren }) => (
    <div className="flex h-[60px] items-center justify-center rounded-[var(--radius-sm)] border border-dashed border-[var(--line)] text-[11px] text-[var(--muted)]">
      Kolom {attrs.width}%
      {renderChildren ? renderChildren() : null}
    </div>
  ),
  Inspector: ({ attrs, onChange }) => (
    <Field label="Lebar (%)">
      <TextInput
        type="number"
        min={10}
        max={100}
        step={5}
        value={String(attrs.width)}
        onChange={(event) => onChange({ width: Number(event.target.value) })}
      />
    </Field>
  ),
});

export interface ColumnsAttrs extends Record<string, unknown> {
  gap: number;
  stackOnMobile: boolean;
}

export const columnsBlock = registerBlock<ColumnsAttrs>({
  type: 'core/columns',
  name: 'Kolom',
  category: 'layout',
  icon: 'Columns3',
  canHaveChildren: true,
  maxDepth: 1,
  defaultAttrs: { gap: 24, stackOnMobile: true },
  Save: ({ attrs, renderChildren }) => (
    <div
      className={`rp-columns ${attrs.stackOnMobile ? 'rp-columns--stack' : ''}`}
      style={{
        display: 'flex',
        gap: `${attrs.gap}px`,
        alignItems: 'flex-start',
        flexWrap: attrs.stackOnMobile ? 'wrap' : 'nowrap',
      }}
    >
      {renderChildren ? renderChildren() : null}
    </div>
  ),
  Edit: ({ attrs }) => (
    <div className="flex h-[60px] items-center justify-center rounded-[var(--radius-sm)] border border-dashed border-[var(--line)] text-[11px] text-[var(--muted)]">
      {attrs.stackOnMobile ? 'Kolom (bertumpuk di mobile)' : 'Kolom'}
    </div>
  ),
  Inspector: ({ attrs, onChange }) => (
    <>
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
      <Toggle
        label="Bertumpuk di mobile"
        checked={attrs.stackOnMobile}
        onChange={(stackOnMobile) => onChange({ stackOnMobile })}
      />
    </>
  ),
});
