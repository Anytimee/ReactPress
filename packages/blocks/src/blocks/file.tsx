import { registerBlock } from '../registry.js';

export interface FileAttrs extends Record<string, unknown> {
  fileId: string;
  filename: string;
  url: string;
  alt: string;
  caption: string;
}

export const fileBlock = registerBlock<FileAttrs>({
  type: 'core/file',
  name: 'File',
  category: 'media',
  icon: 'File',
  canHaveChildren: false,
  maxDepth: 0,
  defaultAttrs: { fileId: '', filename: '', url: '', alt: '', caption: '' },
  Save: (props) => {
    if (!props.attrs.url) return null;
    return (
      <div className="rp-file block p-4 border border-[var(--line)] rounded-[var(--radius-sm)] bg-[var(--surface)]">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-[var(--muted)]" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 00-2 2v3h2V4zm7 6h2v2h-2v-2zm-7 8h2v2H7v-2zm0 4h2v2H7v-2zm4-6V9a2 2 0 00-2-2H5v2h5zM16 12.25a1.75 1.75 0 010 3.5h1.5a1.75 1.75 0 010 3.5H15v5h1.5v-5a1.75 1.75 0 010-3.5H16v1.75z"/></svg>
          <span>{props.attrs.filename}</span>
        </div>
        {props.attrs.alt && <p className="text-[11px] text-[var(--muted)]">{props.attrs.alt}</p>}
        {props.attrs.caption && <p className="mt-2 text-[11px] text-[var(--muted)]">{props.attrs.caption}</p>}
      </div>
    );
  },
  Edit: (props) => (
    <div className="flex flex-col gap-2">
      <input value={props.attrs.filename} onChange={(e) => props.onChange({ ...props.attrs, filename: e.target.value })} placeholder="Nama file" className="w-full bg-transparent text-[12px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)]" />
      <input value={props.attrs.alt} onChange={(e) => props.onChange({ ...props.attrs, alt: e.target.value })} placeholder="Teks alternatif" className="w-full bg-transparent text-[12px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)]" />
    </div>
  ),
  Inspector: () => (
    <div></div>
  ),
});
