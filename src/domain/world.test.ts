import { describe, expect, it } from "vitest";
import { getBlock, makeStarterWorld, setBlock, surfaceHeight } from "./world";

describe("Starter Valley generation", () => {
  it("generates deterministic grass over dirt and stone", () => {
    const world = makeStarterWorld(4109);
    const y = surfaceHeight(world.seed, 0, 0);

    expect(getBlock(world, { x: 0, y, z: 0 })).toBe("grass");
    expect(getBlock(world, { x: 0, y: y - 1, z: 0 })).toBe("dirt");
    expect(getBlock(world, { x: 0, y: y - 4, z: 0 })).toBe("stone");
  });

  it("lets Block Edits override generated terrain", () => {
    const world = makeStarterWorld(4109);
    const pos = { x: 1, y: surfaceHeight(world.seed, 1, 1), z: 1 };

    setBlock(world, pos, "air");

    expect(getBlock(world, pos)).toBe("air");
  });
});
