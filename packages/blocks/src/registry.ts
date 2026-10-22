import type { ReactElement, ReactNode } from 'react';
import type { z } from 'zod';
import type { BlockAttrs, BlockNode } from '@reactpress/types';

export type BlockCategory = 'text' | 'media' | 'layout' | 'embed' | 'advanced';

export interface BlockSaveProps<A extends BlockAttrs = BlockAttrs> {
  node: BlockNode;
  attrs: A;
  /** Render anak (blok container) — selalu tersedia untuk blok yang bisa punya anak. */
  renderChildren?: () => ReactNode;
}

export interface BlockEditProps<A extends BlockAttrs = BlockAttrs> {
  node: BlockNode;
  attrs: A;
  onChange(attrs: A): void;
  selected: boolean;
  renderChildren?: () => ReactNode;
}

export interface BlockInspectorProps<A extends BlockAttrs = BlockAttrs> {
  node: BlockNode;
  attrs: A;
  onChange(attrs: Partial<A>): void;
}

export interface BlockDefinition<A extends BlockAttrs = BlockAttrs> {
  type: string;
  name: string;
  category: BlockCategory;
  /** Nama ikon Lucide (mis. "Type", "Image") — dipetakan di sisi admin. */
  icon: string;
  canHaveChildren: boolean;
  /** Kedalaman maksimum anak yang boleh diterima blok ini. */
  maxDepth: number;
  defaultAttrs: A;
  attributeSchema?: z.ZodType<A>;
  /** Render statis untuk SSR — HARUS murni fungsional (tanpa useState/useEffect). */
  Save(props: BlockSaveProps<A>): ReactElement | null;
  /** Editor di dalam canvas admin (opsional). */
  Edit?(props: BlockEditProps<A>): ReactElement | null;
  /** Panel pengaturan atribut di inspector (opsional). */
  Inspector?(props: BlockInspectorProps<A>): ReactElement | null;}

const registry = new Map<string, BlockDefinition>();

export function registerBlock<A extends BlockAttrs>(definition: BlockDefinition<A>): BlockDefinition<A> {
  if (registry.has(definition.type)) {
    throw new Error(`Blok "${definition.type}" sudah terdaftar.`);
  }
  registry.set(definition.type, definition);
  return definition;
}

export function getBlock(type: string): BlockDefinition | undefined {
  return registry.get(type);
}

export function hasBlock(type: string): boolean {
  return registry.has(type);
}

export function listBlocks(): BlockDefinition[] {
  return [...registry.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function listBlocksByCategory(category: BlockCategory): BlockDefinition[] {
  return listBlocks().filter((definition) => definition.category === category);
}

/** Atribut default untuk blok — dipakai saat menyisipkan blok baru. */
export function createDefaultAttrs(type: string): BlockAttrs {
  const definition = registry.get(type);
  return definition ? { ...definition.defaultAttrs } : {};
}
