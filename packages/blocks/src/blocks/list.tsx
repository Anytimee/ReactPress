import * as React from 'react';
import { registerBlock } from '../registry.js';
import { Field, OptionSelect } from './controls.js';

export interface SpacerAttrs extends Record<string, unknown> {
  height: number;
}

export const spacerBlock = registerBlock<SpacerAttrs>({
  type: 'core/spacer',
  name: 'Spasi',
  category: 'layout',
  icon: 'MoveVertical',
  canHaveChildren: false,
  maxDepth: 0,
  defaultAttrs: { height: 32 },
  Save: ({ attrs }) => (
    <div
      className="rp-spacer"
      style={{ height: `${attrs.height}px` }}
      aria-hidden="true"
      role="presentation"
    />
  ),
  Edit: () => (
    <div className="flex h-[32px] items-center justify-center rounded-[var(--radius-sm)] border border-dashed border-[var(--line)] text-[11px] text-[var(--muted)]">
      Spasi
    </div>
  ),
  Inspector: () => (
    <div></div>
  ),
});

export const separatorBlock = registerBlock<Record<string, never>>({
  type: 'core/separator',
  name: 'Garis pemisah',
  category: 'layout',
  icon: 'Minus',
  canHaveChildren: false,
  maxDepth: 0,
  defaultAttrs: {},
  Save: () => <hr className="rp-separator my-6 border-0 border-t border-[var(--line)]" />,
  Edit: () => (
    <div className="flex h-[24px] items-center justify-center">
      <div className="h-px w-full bg-[var(--line)]" />
    </div>
  ),
  Inspector: () => (
    <p className="text-[11px] text-[var(--muted)]">Garis pemisah tidak punya pengaturan.</p>
  ),
});

export interface ListItemAttrs extends Record<string, unknown> {
  text: string;
  renderChildren?: React.ReactNode;
}

export const listItemBlock = registerBlock<ListItemAttrs>({
  type: 'core/list-item',
  name: 'Butir daftar',
  category: 'text',
  icon: 'List',
  canHaveChildren: true,
  maxDepth: 1,
  defaultAttrs: { text: '' },
  Save: ({ attrs }) => (
    <li className="rp-list-item">
      <span>{attrs.text}</span>
      {attrs.renderChildren ? <div className="rp-list-item__children">{attrs.renderChildren}</div> : null}
    </li>
  ),
  Edit: ({ attrs, onChange }) => (
    <input value={attrs.text} onChange={(event) => onChange({ ...attrs, text: event.target.value })} placeholder="Butir daftar" className="w-full bg-transparent text-[15px] leading-[1.55] text-[var(--ink)] outline-none placeholder:text-[var(--muted)]" />
  ),
  Inspector: ({ attrs, onChange }) => (
    <Field label="Teks">
      <input value={attrs.text} onChange={(event) => onChange({ text: event.target.value })} className="h-8 w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] px-2 text-[12px] text-[var(--ink)]" />
    </Field>
  ),
});

export interface ListAttrs extends Record<string, unknown> {
  ordered: boolean;
}

export const listBlock = registerBlock<ListAttrs>({
  type: 'core/list',
  name: 'Daftar',
  category: 'text',
  icon: 'List',
  canHaveChildren: true,
  maxDepth: 2,
  defaultAttrs: { ordered: false },
  Save: ({ attrs, renderChildren }) => {
    const items = renderChildren ? <>{renderChildren}</> : null;
    return attrs.ordered ? (
      <ol className="rp-list rp-list--ordered">{items}</ol>
    ) : (
      <ul className="rp-list rp-list--unordered">{items}</ul>
    );
  },
  Edit: ({ attrs, onChange, renderChildren }) => (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <OptionSelect
          value={attrs.ordered ? 'ordered' : 'unordered'}
          onChange={(value) => onChange({ ordered: value === 'ordered' })}
          options={['unordered', 'ordered']}
        />
        <span className="text-[11px] text-[var(--muted)]">Jenis daftar</span>
        {renderChildren ? renderChildren() : null}
      </div>
    </div>
  ),
  Inspector: ({ attrs, onChange }) => (
    <Field label="Jenis">
      <OptionSelect
        value={attrs.ordered ? 'ordered' : 'unordered'}
        onChange={(value) => onChange({ ordered: value === 'ordered' })}
        options={['unordered', 'ordered']}
      />
    </Field>
  ),
});
