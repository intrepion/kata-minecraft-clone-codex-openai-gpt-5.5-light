import { type BlockId } from "./blocks";

export type ItemId =
  | "dirt"
  | "log"
  | "plank"
  | "stick"
  | "cobble"
  | "coal"
  | "craftingTable"
  | "woodPickaxe"
  | "stonePickaxe"
  | "torch";

export type Inventory = {
  counts: Record<ItemId, number>;
  hotbar: ItemId[];
  selected: number;
};

export const DEFAULT_HOTBAR: ItemId[] = ["dirt", "log", "plank", "woodPickaxe", "torch"];

export type RecipeId =
  | "planks"
  | "sticks"
  | "craftingTable"
  | "woodPickaxe"
  | "stonePickaxe"
  | "torch";

export type Recipe = {
  id: RecipeId;
  label: string;
  inputs: Partial<Record<ItemId, number>>;
  output: ItemId;
  amount: number;
  requiresTable: boolean;
};

export const RECIPES: Recipe[] = [
  { id: "planks", label: "Planks", inputs: { log: 1 }, output: "plank", amount: 4, requiresTable: false },
  { id: "sticks", label: "Sticks", inputs: { plank: 2 }, output: "stick", amount: 4, requiresTable: false },
  {
    id: "craftingTable",
    label: "Crafting Table",
    inputs: { plank: 4 },
    output: "craftingTable",
    amount: 1,
    requiresTable: false
  },
  {
    id: "woodPickaxe",
    label: "Wood Pickaxe",
    inputs: { stick: 2, plank: 3 },
    output: "woodPickaxe",
    amount: 1,
    requiresTable: true
  },
  {
    id: "stonePickaxe",
    label: "Stone Pickaxe",
    inputs: { stick: 2, cobble: 3 },
    output: "stonePickaxe",
    amount: 1,
    requiresTable: true
  },
  { id: "torch", label: "Torch", inputs: { coal: 1, stick: 1 }, output: "torch", amount: 4, requiresTable: false }
];

export function makeInventory(): Inventory {
  return {
    counts: {
      dirt: 0,
      log: 0,
      plank: 0,
      stick: 0,
      cobble: 0,
      coal: 0,
      craftingTable: 0,
      woodPickaxe: 0,
      stonePickaxe: 0,
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

export function canCraft(inventory: Inventory, recipeId: RecipeId, hasCraftingTable = false): boolean {
  const recipe = findRecipe(recipeId);
  if (recipe.requiresTable && !hasCraftingTable) return false;
  return Object.entries(recipe.inputs).every(([item, amount]) => inventory.counts[item as ItemId] >= amount);
}

export function craft(inventory: Inventory, recipeId: RecipeId, hasCraftingTable = false): boolean {
  if (!canCraft(inventory, recipeId, hasCraftingTable)) return false;
  const recipe = findRecipe(recipeId);
  for (const [item, amount] of Object.entries(recipe.inputs)) {
    inventory.counts[item as ItemId] -= amount;
  }
  addItem(inventory, recipe.output, recipe.amount);
  ensureHotbarHas(inventory, recipe.output);
  return true;
}

function findRecipe(recipeId: RecipeId): Recipe {
  const recipe = RECIPES.find((entry) => entry.id === recipeId);
  if (!recipe) throw new Error(`Unknown recipe ${recipeId}`);
  return recipe;
}

function ensureHotbarHas(inventory: Inventory, item: ItemId): void {
  if (inventory.hotbar.includes(item)) return;
  const emptyIndex = inventory.hotbar.findIndex((hotbarItem) => inventory.counts[hotbarItem] === 0);
  if (emptyIndex >= 0) {
    inventory.hotbar[emptyIndex] = item;
  }
}
