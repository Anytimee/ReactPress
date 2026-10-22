import { z } from 'zod';
import type { BlockDocument, BlockMeta, BlockNode } from '@reactpress/types';

/** Metadata blok: class tambahan dan anchor untuk scroll. */
export const blockMetaSchema: z.ZodType<BlockMeta> = z.object({
  classes: z.array(z.string()),
  anchor: z.string().optional(),
});

/** Satu node blok. Rekursif lewat innerBlocks. */
export const blockNodeSchema: z.ZodType<BlockNode> = z.object({
  id: z.string().min(1, 'id blok wajib diisi'),
  type: z.string().min(1, 'type blok wajib diisi'),
  attrs: z.record(z.unknown()),
  innerBlocks: z.array(z.lazy(() => blockNodeSchema)),
  meta: blockMetaSchema,
});

/** Dokumen konten — versi 1 adalah format awal ReactPress. */
export const blockDocumentSchema: z.ZodType<BlockDocument> = z.object({
  version: z.literal(1),
  blocks: z.array(blockNodeSchema),
});

export const emptyBlockDocument: BlockDocument = { version: 1, blocks: [] };

export type BlockDocumentParseResult = z.SafeParseReturnType<unknown, BlockDocument>;

/**
 * Normalisasi input mentah (mis. dari database atau API) menjadi dokumen valid:
 * mengisi `attrs`, `innerBlocks`, dan `meta` yang kosong.
 */
export function normalizeBlockDocument(input: unknown): BlockDocument {
  const normalizeNode = (raw: unknown): BlockNode => {
    const value = (raw ?? {}) as Partial<BlockNode>;
    const attrs =
      value.attrs && typeof value.attrs === 'object' && !Array.isArray(value.attrs)
        ? (value.attrs as Record<string, unknown>)
        : {};

    return {
      id: typeof value.id === 'string' && value.id.length > 0 ? value.id : createBlockId(),
      type: typeof value.type === 'string' && value.type.length > 0 ? value.type : 'core/paragraph',
      attrs,
      innerBlocks: Array.isArray(value.innerBlocks) ? value.innerBlocks.map(normalizeNode) : [],
      meta: {
        classes: Array.isArray(value.meta?.classes) ? value.meta.classes : [],
        ...(typeof value.meta?.anchor === 'string' && value.meta.anchor.length > 0
          ? { anchor: value.meta.anchor }
          : {}),
      },
    };
  };

  const value = (input ?? {}) as Partial<BlockDocument>;
  const version = value.version === 1 ? 1 : 1;

  return {
    version,
    blocks: Array.isArray(value.blocks) ? value.blocks.map(normalizeNode) : [],
  };
}

export function safeParseBlockDocument(input: unknown): BlockDocumentParseResult {
  return blockDocumentSchema.safeParse(input);
}

/** Parse keras — melempar error bila tidak valid. */
export function parseBlockDocument(input: unknown): BlockDocument {
  return blockDocumentSchema.parse(input);
}

/** Id blok acak yang stabil-format (16 hex char). */
export function createBlockId(): string {
  const random = Math.random().toString(16).slice(2, 10);
  const stamp = Date.now().toString(16);
  return `${stamp}${random}`.padEnd(16, '0').slice(0, 16);
}
