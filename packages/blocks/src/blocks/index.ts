import type { BlockDefinition } from '../registry.js';
import { buttonBlock } from './button.js';
import { columnBlock, columnsBlock } from './columns.js';
import { coverBlock } from './cover.js';
import { embedBlock } from './embed.js';
import { groupBlock } from './group.js';
import { headingBlock } from './heading.js';
import { htmlBlock } from './html.js';
import { imageBlock } from './image.js';
import { listBlock, listItemBlock, separatorBlock, spacerBlock } from './list.js';
import { paragraphBlock } from './paragraph.js';
import { patternRefBlock } from './pattern-ref.js';
import { quoteBlock } from './quote.js';

export const coreBlocks: BlockDefinition[] = [
  paragraphBlock,
  headingBlock,
  imageBlock,
  listBlock,
  listItemBlock,
  quoteBlock,
  buttonBlock,
  spacerBlock,
  separatorBlock,
  columnsBlock,
  columnBlock,
  groupBlock,
  coverBlock,
  htmlBlock,
  patternRefBlock,
  embedBlock,
];

export {
  buttonBlock,
  columnBlock,
  columnsBlock,
  coverBlock,
  embedBlock,
  groupBlock,
  headingBlock,
  htmlBlock,
  imageBlock,
  listBlock,
  listItemBlock,
  paragraphBlock,
  patternRefBlock,
  quoteBlock,
  separatorBlock,
  spacerBlock,
};
