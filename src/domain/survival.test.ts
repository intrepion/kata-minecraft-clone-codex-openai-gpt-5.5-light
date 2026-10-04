import { describe, expect, it } from "vitest";
import { makeStarterWorld, setBlock } from "./world";
import { applyShadowPressure, hasShelterProtection, hasTorchProtection, isNight } from "./survival";

describe("Shadow Pressure", () => {
  it("drains health at night while exposed", () => {
    const world = makeStarterWorld();

    expect(isNight(0.7)).toBe(true);
    expect(applyShadowPressure(world, { x: 0.5, y: 14, z: 0.5 }, 20, 0.7, 2)).toBeLessThan(20);
  });

  it("uses torchlight and shelter as Protection Checks", () => {
    const world = makeStarterWorld();
    const position = { x: 0.5, y: 14, z: 0.5 };
    setBlock(world, { x: 3, y: 14, z: 0 }, "torch");

    expect(hasTorchProtection(world, position)).toBe(true);

    const sheltered = makeStarterWorld();
    setBlock(sheltered, { x: 0, y: 17, z: 0 }, "plank");
    setBlock(sheltered, { x: 1, y: 15, z: 0 }, "plank");
    setBlock(sheltered, { x: -1, y: 15, z: 0 }, "plank");
    setBlock(sheltered, { x: 0, y: 15, z: 1 }, "plank");

    expect(hasShelterProtection(sheltered, position)).toBe(true);
    expect(applyShadowPressure(sheltered, position, 20, 0.7, 2)).toBe(20);
  });
});
