/**
 * Struktur konten block (bentuk data, tanpa runtime).
 * Skema zod yang memvalidasi bentuk ini ada di @reactpress/blocks/schema.
 */

export interface UniqueIdentifier {
  id: string;
}

export interface BlockMeta {
  classes: string[];
  anchor?: string;
}

export interface BlockNode {
  id: string;
  type: string;
  attrs: Record<string, unknown>;
  innerBlocks: BlockNode[];
  meta: BlockMeta;
}

export interface BlockDocument {
  version: 1;
  blocks: BlockNode[];
}

export type BlockAttrs = Record<string, unknown>;

export const BLOCK_DOCUMENT_VERSION = 1 as const;
