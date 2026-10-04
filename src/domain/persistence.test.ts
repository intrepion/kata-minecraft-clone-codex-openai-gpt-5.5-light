import { describe, expect, it } from "vitest";
import { addItem, makeInventory } from "./inventory";
import { applySave, makeSave } from "./persistence";
import { makeSurvivalState } from "./survival";
import { getBlock, makeStarterWorld, setBlock } from "./world";

describe("Local World Save", () => {
  it("persists seed-derived world state as edits plus player, inventory, and time", () => {
    const world = makeStarterWorld(4109);
    const inventory = makeInventory();
    const survival = makeSurvivalState();
    const player = { position: { x: 4, y: 12, z: 7 }, health: 13 };
    setBlock(world, { x: 1, y: 8, z: 1 }, "plank");
    addItem(inventory, "torch", 3);
    survival.timeOfDay = 0.72;

    const save = makeSave(world, player, inventory, survival);
    const restoredWorld = makeStarterWorld(save.seed);
    const restoredInventory = makeInventory();
    const restoredSurvival = makeSurvivalState();
    const restoredPlayer = { position: { x: 0, y: 0, z: 0 }, health: 20 };
    applySave(save, restoredWorld, restoredPlayer, restoredInventory, restoredSurvival);

    expect(getBlock(restoredWorld, { x: 1, y: 8, z: 1 })).toBe("plank");
    expect(restoredPlayer).toEqual(player);
    expect(restoredInventory.counts.torch).toBe(3);
    expect(restoredSurvival.timeOfDay).toBe(0.72);
  });
});
