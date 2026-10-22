import { registerBlock } from '../registry.js';
import { Field, OptionSelect, TextInput } from './controls.js';
import { parseVideoId, safeUrl } from './utils.js';

export interface EmbedAttrs extends Record<string, unknown> {
  url: string;
  provider: 'youtube' | 'twitter' | 'vimeo';
  title: string;
}

const PROVIDERS: EmbedAttrs['provider'][] = ['youtube', 'vimeo', 'twitter'];

function buildEmbedUrl(provider: EmbedAttrs['provider'], url: string): string | null {
  if (provider === 'twitter') {
    const match = /^https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[^/]+\/status\/(\d+)/.exec(url.trim());
    const id = match?.[1];
    return id ? `https://platform.twitter.com/embed/Tweet.html?id=${id}` : null;
  }

  const parsed = parseVideoId(url);
  if (!parsed) return null;
  if (parsed.provider === 'youtube') {
    return `https://www.youtube-nocookie.com/embed/${parsed.id}`;
  }
  return `https://player.vimeo.com/video/${parsed.id}`;
}

export const embedBlock = registerBlock<EmbedAttrs>({
  type: 'core/embed',
  name: 'Embed',
  category: 'embed',
  icon: 'Video',
  canHaveChildren: false,
  maxDepth: 0,
  defaultAttrs: { url: '', provider: 'youtube', title: '' },
  Save: ({ attrs }) => {
    const source = buildEmbedUrl(attrs.provider, attrs.url);
    if (!source) {
      return (
        <p className="rp-embed-fallback text-[13px] text-[var(--muted)]">
          {attrs.title || 'Embed tidak dapat ditampilkan — periksa URL.'}
        </p>
      );
    }

    return (
      <figure className="rp-embed">
        <iframe
          src={source}
          title={attrs.title || 'Embedded media'}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          className="aspect-video w-full rounded-[var(--radius)] border border-[var(--line)]"
        />
        {attrs.title ? (
          <figcaption className="mt-2 text-[13px] text-[var(--muted)]">{attrs.title}</figcaption>
        ) : null}
      </figure>
    );
  },
  Edit: ({ attrs, onChange }) => (
    <div className="flex flex-col gap-2">
      <input
        value={attrs.url}
        onChange={(event) => onChange({ ...attrs, url: event.target.value })}
        placeholder="https://youtube.com/watch?v=..."
        className="w-full bg-transparent text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
      />
      <span className="text-[11px] text-[var(--muted)]">
        {buildEmbedUrl(attrs.provider, attrs.url)
          ? 'Pratinjau siap.'
          : 'URL belum dikenali untuk provider ini.'}
      </span>
    </div>
  ),
  Inspector: ({ attrs, onChange }) => (
    <>
      <Field label="Provider">
        <OptionSelect
          value={attrs.provider}
          onChange={(provider) => onChange({ provider: provider as EmbedAttrs['provider'] })}
          options={PROVIDERS}
        />
      </Field>
      <Field label="URL">
        <TextInput
          value={attrs.url}
          onChange={(event) => onChange({ url: event.target.value })}
        />
      </Field>
      <Field label="Judul">
        <TextInput
          value={attrs.title}
          onChange={(event) => onChange({ title: event.target.value })}
        />
      </Field>
    </>
  ),
});

export function isValidEmbedUrl(url: string): boolean {
  return safeUrl(url).length > 0;
}
