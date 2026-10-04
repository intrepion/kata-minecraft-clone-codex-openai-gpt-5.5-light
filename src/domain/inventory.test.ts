import { describe, expect, it } from "vitest";
import { addItem, blockForItem, canCraft, consumeSelected, craft, dropForBlock, makeInventory } from "./inventory";

describe("Drop Rules and Hotbar", () => {
  it("uses simple but non-universal Drop Rules", () => {
    expect(dropForBlock("dirt")).toBe("dirt");
    expect(dropForBlock("grass")).toBe("dirt");
    expect(dropForBlock("stone")).toBe("cobble");
    expect(dropForBlock("coalOre")).toBe("coal");
    expect(dropForBlock("leaves")).toBeNull();
  });

  it("consumes the selected placeable hotbar item", () => {
    const inventory = makeInventory();
    addItem(inventory, "dirt", 2);

    expect(consumeSelected(inventory)).toBe("dirt");
    expect(blockForItem("dirt")).toBe("dirt");
    expect(inventory.counts.dirt).toBe(1);
  });

  it("crafts the MVP resource progression recipes and rejects unaffordable work", () => {
    const inventory = makeInventory();
    addItem(inventory, "log", 1);

    expect(craft(inventory, "planks")).toBe(true);
    expect(inventory.counts.plank).toBe(4);
    expect(craft(inventory, "craftingTable")).toBe(true);
    expect(craft(inventory, "woodPickaxe")).toBe(false);

    addItem(inventory, "plank", 5);
    expect(craft(inventory, "sticks")).toBe(true);
    expect(canCraft(inventory, "woodPickaxe", true)).toBe(true);
    expect(craft(inventory, "woodPickaxe", true)).toBe(true);
    expect(inventory.counts.woodPickaxe).toBe(1);
  });
});
