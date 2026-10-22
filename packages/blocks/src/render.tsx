import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import type { BlockAttrs, BlockDocument, BlockNode } from '@reactpress/types';
import { getBlock } from './registry.js';

export interface RenderBlocksOptions {
  className?: string;
  /** Dipanggil saat type blok tidak dikenal (mis. versi konten lebih lama). */
  onUnknownBlock?: (node: BlockNode) => void;
}

function mergeClasses(...values: (string | undefined)[]): string | undefined {
  const joined = values.filter((value): value is string => Boolean(value && value.length > 0)).join(' ');
  return joined.length > 0 ? joined : undefined;
}

/**
 * Render satu node blok secara rekursif.
 * SSR-safe: tanpa akses window/document, tanpa hooks.
 */
export function renderBlockNode(node: BlockNode, options: RenderBlocksOptions = {}): ReactNode {
  const definition = getBlock(node.type);

  if (!definition) {
    options.onUnknownBlock?.(node);
    return null;
  }

  const element = definition.Save({
    node,
    attrs: node.attrs as BlockAttrs,
    renderChildren: () => node.innerBlocks.map((child) => renderBlockNode(child, options)),
  });

  if (!isValidElement(element)) {
    return null;
  }

  if (typeof element.type !== 'string') {
    return cloneElement(element as ReactElement, { key: node.id });
  }

  const props = (element as ReactElement).props as {
    className?: string;
    id?: string;
  };

  return cloneElement(element as ReactElement, {
    key: node.id,
    className: mergeClasses(props.className, ...node.meta.classes),
    id: node.meta.anchor ?? props.id,
  });
}

/**
 * Render seluruh dokumen blok. Dipakai oleh situs publik (SSR) dan preview.
 */
export function renderBlocks(document: BlockDocument, options: RenderBlocksOptions = {}): ReactNode {
  if (!document || !Array.isArray(document.blocks)) {
    return null;
  }
  return (
    <div className={mergeClasses('rp-blocks', options.className)}>
      {document.blocks.map((node) => renderBlockNode(node, options))}
    </div>
  );
}
