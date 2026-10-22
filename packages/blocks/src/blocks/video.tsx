import { registerBlock } from '../registry.js';

export interface VideoAttrs extends Record<string, unknown> {
  url: string;
  title: string;
  alt: string;
  caption: string;
  mimeType: string;
}

export const videoBlock = registerBlock<VideoAttrs>({
  type: 'core/video',
  name: 'Video',
  category: 'media',
  icon: 'Video',
  canHaveChildren: false,
  maxDepth: 0,
  defaultAttrs: { url: '', title: '', alt: '', caption: '', mimeType: '' },
  Save: (props) => {
    if (!props.attrs.url) return null;
    return (
      <figure className="rp-video block rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] overflow-hidden">
        <video
          src={props.attrs.url}
          className="w-full rounded-[var(--radius)]"
          controls
          autoPlay
          muted
        />
        {props.attrs.caption && (
          <figcaption className="rp-video-caption text-[11px] text-[var(--muted)] p-2 border-t border-[var(--line)]">
            {props.attrs.caption}
          </figcaption>
        )}
      </figure>
    );
  },
  Edit: (props) => (
    <div className="flex flex-col gap-2">
      <input
        value={props.attrs.url}
        onChange={(e) => props.onChange({ ...props.attrs, url: e.target.value })}
        placeholder="URL Video"
        className="w-full bg-transparent text-[12px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
      />
      <input
        value={props.attrs.title}
        onChange={(e) => props.onChange({ ...props.attrs, title: e.target.value })}
        placeholder="Judul video"
        className="w-full bg-transparent text-[12px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
      />
      <input
        value={props.attrs.alt}
        onChange={(e) => props.onChange({ ...props.attrs, alt: e.target.value })}
        placeholder="Teks alternatif"
        className="w-full bg-transparent text-[12px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
      />
    </div>
  ),
  Inspector: () => (
    <div></div>
  ),
});
