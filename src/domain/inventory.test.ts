import { describe, expect, it } from "vitest";
import { addItem, blockForItem, consumeSelected, dropForBlock, makeInventory } from "./inventory";

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
});
