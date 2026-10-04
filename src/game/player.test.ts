import { describe, expect, it } from "vitest";
import { makeStarterWorld } from "../domain/world";
import { makePlayer, updatePlayer } from "./player";

describe("Player movement", () => {
  it("moves W forward and S backward relative to the default camera direction", () => {
    const world = makeStarterWorld();
    const player = makePlayer({ x: 0.5, y: 14, z: 0.5 });
    const startZ = player.position.z;

    updatePlayer(world, player, { forward: true, backward: false, left: false, right: false, jump: false }, 0.1);
    expect(player.position.z).toBeLessThan(startZ);

    const afterForwardZ = player.position.z;
    updatePlayer(world, player, { forward: false, backward: true, left: false, right: false, jump: false }, 0.1);
    expect(player.position.z).toBeGreaterThan(afterForwardZ);
  });
});
