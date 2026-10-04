import { type BlockId } from "./blocks";

export type ItemId = "dirt" | "log" | "plank" | "cobble" | "coal" | "craftingTable" | "torch";

export type Inventory = {
  counts: Record<ItemId, number>;
  hotbar: ItemId[];
  selected: number;
};

export const DEFAULT_HOTBAR: ItemId[] = ["dirt", "log", "plank", "craftingTable", "torch"];

export function makeInventory(): Inventory {
  return {
    counts: {
      dirt: 0,
      log: 0,
      plank: 0,
      cobble: 0,
      coal: 0,
      craftingTable: 0,
      torch: 0
    },
    hotbar: [...DEFAULT_HOTBAR],
    selected: 0
  };
}

export function dropForBlock(block: BlockId): ItemId | null {
  if (block === "dirt" || block === "grass") return "dirt";
  if (block === "log") return "log";
  if (block === "plank") return "plank";
  if (block === "craftingTable") return "craftingTable";
  if (block === "torch") return "torch";
  if (block === "stone") return "cobble";
  if (block === "coalOre") return "coal";
  return null;
}

export function blockForItem(item: ItemId): BlockId | null {
  if (item === "dirt") return "dirt";
  if (item === "log") return "log";
  if (item === "plank") return "plank";
  if (item === "craftingTable") return "craftingTable";
  if (item === "torch") return "torch";
  return null;
}

export function addItem(inventory: Inventory, item: ItemId, amount = 1): void {
  inventory.counts[item] += amount;
}

export function consumeSelected(inventory: Inventory): ItemId | null {
  const item = inventory.hotbar[inventory.selected];
  if (!item || inventory.counts[item] <= 0) return null;
  inventory.counts[item] -= 1;
  return item;
}
