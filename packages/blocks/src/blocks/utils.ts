import DOMPurify from 'isomorphic-dompurify';

const INLINE_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'strike',
  'code',
  'mark',
  'sub',
  'sup',
  'a',
  'span',
];

const HTML_TAGS = [
  ...INLINE_TAGS,
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'blockquote',
  'pre',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
  'img',
  'figure',
  'figcaption',
  'hr',
  'div',
  'section',
  'article',
  'small',
  'time',
];

const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'target', 'rel', 'class', 'colspan', 'rowspan'];

export function sanitizeInlineHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: INLINE_TAGS, ALLOWED_ATTR });
}

export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: HTML_TAGS, ALLOWED_ATTR });
}

/**
 * Bila HTML berisi tepat satu <p>…</p>, kembalikan isi dalamnya supaya blok
 * paragraf bisa dirender sebagai <p> (bukan <p><p>…</p></p>).
 */
export function unwrapSingleParagraph(html: string): { html: string; single: boolean } {
  const match = /^<p(?:\s[^>]*)?>([\s\S]*)<\/p>$/.exec(html.trim());
  if (match) {
    return { html: match[1] ?? '', single: true };
  }
  return { html: html.trim(), single: false };
}

export function mergeClasses(...values: (string | undefined | false)[]): string {
  return values.filter((value): value is string => Boolean(value)).join(' ');
}

/** Ambil URL gambar/embed aman untuk atribut src. */
export function safeUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return '';
}

/** Ambil id video YouTube / Vimeo dari URL. */
export function parseVideoId(url: string): { provider: 'youtube' | 'vimeo'; id: string } | null {
  const trimmed = url.trim();

  const youtube = /^https?:\/\/(?:www\.)?youtube\.com\/watch\?(?:.*&)?v=([\w-]{6,})/.exec(trimmed);
  if (youtube?.[1]) return { provider: 'youtube', id: youtube[1] };

  const youtubeShort = /^https?:\/\/(?:www\.)?youtu\.be\/([\w-]{6,})/.exec(trimmed);
  if (youtubeShort?.[1]) return { provider: 'youtube', id: youtubeShort[1] };

  const vimeo = /^https?:\/\/(?:www\.)?vimeo\.com\/(\d+)/.exec(trimmed);
  if (vimeo?.[1]) return { provider: 'vimeo', id: vimeo[1] };

  return null;
}
