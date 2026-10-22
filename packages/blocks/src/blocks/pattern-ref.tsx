import type { BlockNode } from '@reactpress/types';
import { registerBlock } from '../registry.js';
import { renderBlockNode } from '../render.js';
import { Field, TextInput } from './controls.js';

export interface PatternRefAttrs extends Record<string, unknown> {
  patternId: string;
  patternName: string;
  snapshot: BlockNode[];
}

export const patternRefBlock = registerBlock<PatternRefAttrs>({
  type: 'core/pattern-ref',
  name: 'Pattern',
  category: 'advanced',
  icon: 'Blocks',
  canHaveChildren: false,
  maxDepth: 0,
  defaultAttrs: { patternId: '', patternName: '', snapshot: [] },
  Save: ({ attrs }) => {
    const snapshot = Array.isArray(attrs.snapshot) ? attrs.snapshot : [];
    if (snapshot.length === 0) return null;
    return (
      <div className="rp-pattern" data-pattern-id={attrs.patternId}>
        {snapshot.map((node) => renderBlockNode(node))}
      </div>
    );
  },
  Edit: ({ attrs }) => (
    <div className="flex h-[60px] items-center justify-center rounded-[var(--radius-sm)] border border-dashed border-[var(--line)] text-[11px] text-[var(--muted)]">
      {attrs.patternName ? `Pattern: ${attrs.patternName}` : 'Pattern'}
    </div>
  ),
  Inspector: ({ attrs }) => (
    <Field label="Pattern">
      <TextInput value={attrs.patternName} readOnly />
    </Field>
  ),
});
