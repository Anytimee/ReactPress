import { registerBlock } from '../registry.js';
import { Field, TextInput } from './controls.js';

export interface ImageAttrs extends Record<string, unknown> {
  mediaId: string;
  url: string;
  alt: string;
  caption: string;
  align: 'left' | 'center' | 'right' | 'wide';
  width: number;
}

export const imageBlock = registerBlock<ImageAttrs>({
  type: 'core/image',
  name: 'Gambar',
  category: 'media',
  icon: 'Image',
  canHaveChildren: false,
  maxDepth: 0,
  defaultAttrs: {
    mediaId: '',
    url: '',
    alt: '',
    caption: '',
    align: 'center',
    width: 100,
  },
  Save: ({ attrs }) => {
    if (!attrs.url) return null;
    const alignment =
      attrs.align === 'wide'
        ? 'w-full'
        : attrs.align === 'left'
          ? 'mr-auto'
          : attrs.align === 'right'
            ? 'ml-auto'
            : 'mx-auto';

    return (
      <figure className={`rp-figure ${alignment} block`} style={{ width: `${attrs.width}%` }}>
        <img
          src={attrs.url}
          alt={attrs.alt}
          loading="lazy"
          className="block h-auto w-full rounded-[var(--radius)] border border-[var(--line)]"
        />
        {attrs.caption ? <figcaption className="mt-2 text-[13px] text-[var(--muted)]">{attrs.caption}</figcaption> : null}
      </figure>
    );
  },
  Edit: ({ attrs, onChange }) => (
    <div className="flex flex-col gap-2">
      {attrs.url ? (
        <img
          src={attrs.url}
          alt={attrs.alt}
          className="max-h-[240px] w-full object-contain rounded-[var(--radius)] border border-[var(--line)]"
        />
      ) : (
        <div className="flex h-[120px] items-center justify-center rounded-[var(--radius)] border border-dashed border-[var(--line)] text-[12px] text-[var(--muted)]">
          Belum ada gambar — pilih dari Media
        </div>
      )}
      <input
        value={attrs.alt}
        onChange={(event) => onChange({ ...attrs, alt: event.target.value })}
        placeholder="Teks alternatif"
        className="w-full bg-transparent text-[12px] text-[var(--muted)] outline-none placeholder:text-[var(--muted)]"
      />
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
      <Field label="Alt text">
        <TextInput
          value={attrs.alt}
          onChange={(event) => onChange({ alt: event.target.value })}
        />
      </Field>
      <Field label="Caption">
        <TextInput
          value={attrs.caption}
          onChange={(event) => onChange({ caption: event.target.value })}
        />
      </Field>
      <Field label="Perataan">
        <select
          value={attrs.align}
          onChange={(event) => onChange({ align: event.target.value as ImageAttrs['align'] })}
          className="h-8 w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] px-2 text-[12px] text-[var(--ink)]"
        >
          <option value="left">Kiri</option>
          <option value="center">Tengah</option>
          <option value="right">Kanan</option>
          <option value="wide">Penuh</option>
        </select>
      </Field>
      <Field label="Lebar (%)">
        <TextInput
          type="number"
          min={10}
          max={100}
          value={String(attrs.width)}
          onChange={(event) => onChange({ width: Number(event.target.value) })}
        />
      </Field>
    </>
  ),
});
