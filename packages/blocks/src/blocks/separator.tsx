import { registerBlock } from '../registry.js';

export const separatorBlock = registerBlock({
  type: 'core/separator',
  name: 'Pemisah',
  category: 'layout',
  icon: 'Separator',
  canHaveChildren: false,
  maxDepth: 0,
  defaultAttrs: {},
  Save: ({ attrs }) => {
    (attrs);
    return (
      <div className="rp-separator block h-[1px] my-8 bg-[var(--line)] rounded-[var(--radius-sm)] overflow-hidden" />
    );
  },
  Edit: () => {
    return (
      <div className="flex items-center gap-2 py-2 cursor-pointer select-none">
        <div className="flex-1 h-[1px] bg-[var(--line)]" />
        <svg className="h-4 w-4 text-[var(--muted)]" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 00-2 2v3h2V4zm7 6h2v2H7v-2zm-7 8h2v2H7v-2zm0 4h2v2H7v-2zm4-6V9a2 2 0 00-2-2H5v2h5zM16 12.25a1.75 1.75 0 010 3.5h1.5a1.75 1.75 0 010 3.5H15v5h1.5v-5a1.75 1.75 0 010-3.5H16v1.75z"/></svg>
      </div>
    );
  },
  Inspector: () => <div></div>,
});
