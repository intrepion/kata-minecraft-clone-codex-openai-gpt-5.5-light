export type BlockId =
  | "air"
  | "grass"
  | "dirt"
  | "stone"
  | "log"
  | "leaves"
  | "coalOre"
  | "plank"
  | "craftingTable"
  | "torch";

export type BlockDefinition = {
  id: BlockId;
  solid: boolean;
  color: number;
  breakTime: number;
  placeable: boolean;
};

export const BLOCKS: Record<BlockId, BlockDefinition> = {
  air: { id: "air", solid: false, color: 0x000000, breakTime: 0, placeable: false },
  grass: { id: "grass", solid: true, color: 0x4e8a42, breakTime: 0.55, placeable: false },
  dirt: { id: "dirt", solid: true, color: 0x73513a, breakTime: 0.45, placeable: true },
  stone: { id: "stone", solid: true, color: 0x7e8178, breakTime: 1.7, placeable: false },
  log: { id: "log", solid: true, color: 0x7a5431, breakTime: 0.9, placeable: true },
  leaves: { id: "leaves", solid: true, color: 0x3f7a3f, breakTime: 0.35, placeable: false },
  coalOre: { id: "coalOre", solid: true, color: 0x555550, breakTime: 1.9, placeable: false },
  plank: { id: "plank", solid: true, color: 0xb4874f, breakTime: 0.55, placeable: true },
  craftingTable: { id: "craftingTable", solid: true, color: 0x9b7042, breakTime: 0.65, placeable: true },
  torch: { id: "torch", solid: false, color: 0xf6bd4a, breakTime: 0.2, placeable: true }
};

export function isSolid(block: BlockId): boolean {
  return BLOCKS[block].solid;
}
