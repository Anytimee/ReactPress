import { create } from 'zustand';

interface BlockState {
  blocks: any;
  setBlocks: (blocks: any) => void;
  addBlock: (block: any) => void;
  removeBlock: (id: string) => void;
  updateBlockAttr: (id: string, attrs: any) => void;
}

export const useEditorStore = create<BlockState>((set) => ({
  blocks: [],
  setBlocks: (blocks) => set({ blocks }),
  addBlock: (block) => set((state) => ({ blocks: [...state.blocks, block] })),
  removeBlock: (id) =>
    set((state) => ({
      blocks: state.blocks.filter((b: any) => b.id !== id),
    })),
  updateBlockAttr: (id, attrs) =>
    set((state) => ({
      blocks: state.blocks.map((b: any) =>
        b.id === id ? { ...b, attrs } : b,
      ),
    })),
}));