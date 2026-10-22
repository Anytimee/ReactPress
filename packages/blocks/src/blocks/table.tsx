import { registerBlock } from '../registry.js';

export interface TableAttrs extends Record<string, unknown> {
  rows: number;
  cols: number;
  data: string[][];
  header: boolean;
}

export const tableBlock = registerBlock<TableAttrs>({
  type: 'core/table',
  name: 'Meja',
  category: 'layout',
  icon: 'Table',
  canHaveChildren: false,
  maxDepth: 0,
  defaultAttrs: { rows: 2, cols: 2, data: [['', ''], ['', '']], header: true },
  Save: () => (
    <table className="rp-table w-full rounded-[var(--border-sm)] border border-[var(--line)] bg-[var(--surface)]">
      <thead>
        <tr>
          <th className="rp-table-cell p-2 border border-[var(--line)] bg-[var(--surface)] text-[12px] text-[var(--ink)]">Header 1</th>
          <th className="rp-table-cell p-2 border border-[var(--line)] bg-[var(--surface)] text-[12px] text-[var(--ink)]">Header 2</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="rp-table-cell p-2 border border-[var(--line)] text-[12px] text-[var(--ink)]">Data 1</td>
          <td className="rp-table-cell p-2 border border-[var(--line)] text-[12px] text-[var(--ink)]">Data 2</td>
        </tr>
      </tbody>
    </table>
  ),
  Edit: () => (
    <div>
      <select defaultValue="2" className="w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] px-2 text-[12px] text-[var(--ink)] mb-2">
        {[...Array(6)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
      </select>
      <select defaultValue="2" className="w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] px-2 text-[12px] text-[var(--ink)] mb-2">
        {[...Array(6)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
      </select>
    </div>
  ),
  Inspector: () => (
    <div></div>
  ),
});
