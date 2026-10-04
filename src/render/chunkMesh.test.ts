import { describe, expect, it } from "vitest";
import { makeStarterWorld } from "../domain/world";
import { buildChunkMesh } from "./chunkMesh";

describe("Chunk Mesh", () => {
  it("generates visible surface geometry for a Starter Valley chunk", () => {
    const data = buildChunkMesh(makeStarterWorld(4109), 0, 0);

    expect(data.positions.length).toBeGreaterThan(1_000);
    expect(data.indices.length).toBeGreaterThan(1_000);
    expect(data.colors.length).toBe(data.positions.length);
  });
});
