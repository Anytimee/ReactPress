import { registerBlock } from '../registry.js';
import { Field, OptionSelect, TextInput } from './controls.js';

export interface CoverAttrs extends Record<string, unknown> {
  mediaId: string;
  url: string;
  overlay: number;
  minHeight: number;
  align: 'left' | 'center' | 'right';
}

export const coverBlock = registerBlock<CoverAttrs>({
  type: 'core/cover',
  name: 'Cover',
  category: 'media',
  icon: 'PanelTop',
  canHaveChildren: true,
  maxDepth: 0,
  defaultAttrs: { mediaId: '', url: '', overlay: 40, minHeight: 320, align: 'center' },
  Save: ({ attrs, renderChildren }) => (
    <section
      className="rp-cover relative overflow-hidden rounded-[var(--radius)] border border-[var(--line)]"
      style={{
        minHeight: `${attrs.minHeight}px`,
        backgroundImage: attrs.url ? `url(${attrs.url})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {attrs.url ? (
        <div
          className="absolute inset-0"
          style={{ background: `rgba(17,17,17,${Math.min(100, Math.max(0, attrs.overlay)) / 100})` }}
        />
      ) : null}
      <div
        className="relative z-10 flex h-full w-full flex-col justify-center p-6"
        style={{
          textAlign: attrs.align,
          alignItems:
            attrs.align === 'left' ? 'flex-start' : attrs.align === 'right' ? 'flex-end' : 'center',
        }}
      >
        {renderChildren ? renderChildren() : null}
      </div>
    </section>
  ),
  Edit: ({ attrs, renderChildren }) => (
    <div
      className="flex h-[140px] items-center justify-center rounded-[var(--radius-sm)] border border-dashed border-[var(--line)] text-[11px] text-[var(--muted)]"
      style={{
        backgroundImage: attrs.url ? `url(${attrs.url})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      Cover
      {renderChildren ? renderChildren() : null}
    </div>
  ),
  Inspector: ({ attrs, onChange }) => (
    <>
      <Field label="URL gambar">
        <TextInput
          value={attrs.url}
          onChange={(event) => onChange({ url: event.target.value })}
        />
      </Field>
      <Field label="Media ID">
        <TextInput
          value={attrs.mediaId}
          onChange={(event) => onChange({ mediaId: event.target.value })}
        />
      </Field>
      <Field label="Overlay (0-100)">
        <TextInput
          type="number"
          min={0}
          max={100}
          value={String(attrs.overlay)}
          onChange={(event) => onChange({ overlay: Number(event.target.value) })}
        />
      </Field>
      <Field label="Tinggi minimum (px)">
        <TextInput
          type="number"
          min={120}
          max={900}
          step={20}
          value={String(attrs.minHeight)}
          onChange={(event) => onChange({ minHeight: Number(event.target.value) })}
        />
      </Field>
      <Field label="Perataan konten">
        <OptionSelect
          value={attrs.align}
          onChange={(align) => onChange({ align: align as CoverAttrs['align'] })}
          options={['left', 'center', 'right']}
        />
      </Field>
    </>
  ),
});
