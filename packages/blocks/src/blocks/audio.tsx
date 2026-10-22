import { registerBlock } from '../registry.js';

export interface AudioAttrs extends Record<string, unknown> {
  url: string;
  title: string;
  alt: string;
  caption: string;
  mimeType: string;
}

export const audioBlock = registerBlock<AudioAttrs>({
  type: 'core/audio',
  name: 'Audio',
  category: 'media',
  icon: 'Music',
  canHaveChildren: false,
  maxDepth: 0,
  defaultAttrs: { url: '', title: '', alt: '', caption: '', mimeType: '' },
  Save: (props) => {
    if (!props.attrs.url) return null;
    return (
      <figure className="rp-audio block rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] overflow-hidden">
        <audio
          src={props.attrs.url}
          className="w-full"
          controls
          autoPlay
          muted
        />
        {props.attrs.caption && (
          <figcaption className="rp-audio-caption text-[11px] text-[var(--muted)] p-2 border-t border-[var(--line)]">
            {props.attrs.caption}
          </figcaption>
        )}
      </figure>
    );
  },
  Edit: (props) => (
    <div className="flex flex-col gap-2">
      <input value={props.attrs.url} onChange={(e) => props.onChange({ ...props.attrs, url: e.target.value })} placeholder="URL Audio" className="w-full bg-transparent text-[12px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)]" />
      <input value={props.attrs.title} onChange={(e) => props.onChange({ ...props.attrs, title: e.target.value })} placeholder="Judul audio" className="w-full bg-transparent text-[12px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)]" />
    </div>
  ),
  Inspector: () => (
    <div></div>
  ),
});
