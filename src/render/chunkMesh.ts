import {
  CHUNK_SIZE,
  WORLD_MAX_Y,
  WORLD_MIN_Y,
  getBlock,
  type BlockPos,
  type StarterWorld
} from "../domain/world";
import { BLOCKS, isSolid, type BlockId } from "../domain/blocks";

export type MeshData = {
  positions: number[];
  normals: number[];
  colors: number[];
  indices: number[];
};

type Face = {
  normal: [number, number, number];
  corners: [number, number, number][];
};

const FACES: Face[] = [
  { normal: [1, 0, 0], corners: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]] },
  { normal: [-1, 0, 0], corners: [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]] },
  { normal: [0, 1, 0], corners: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]] },
  { normal: [0, -1, 0], corners: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]] },
  { normal: [0, 0, 1], corners: [[1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1]] },
  { normal: [0, 0, -1], corners: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]] }
];

export function buildChunkMesh(world: StarterWorld, chunkX: number, chunkZ: number): MeshData {
  const data: MeshData = { positions: [], normals: [], colors: [], indices: [] };
  const startX = chunkX * CHUNK_SIZE;
  const startZ = chunkZ * CHUNK_SIZE;
  for (let x = startX; x < startX + CHUNK_SIZE; x += 1) {
    for (let y = WORLD_MIN_Y; y <= WORLD_MAX_Y; y += 1) {
      for (let z = startZ; z < startZ + CHUNK_SIZE; z += 1) {
        const block = getBlock(world, { x, y, z });
        if (!isSolid(block)) continue;
        addVisibleFaces(data, world, { x, y, z }, block);
      }
    }
  }
  return data;
}

function addVisibleFaces(data: MeshData, world: StarterWorld, pos: BlockPos, block: BlockId): void {
  for (const face of FACES) {
    const neighbor = {
      x: pos.x + face.normal[0],
      y: pos.y + face.normal[1],
      z: pos.z + face.normal[2]
    };
    if (isSolid(getBlock(world, neighbor))) continue;
    const base = data.positions.length / 3;
    const [r, g, b] = colorToRgb(BLOCKS[block].color, face.normal);
    for (const corner of face.corners) {
      data.positions.push(pos.x + corner[0], pos.y + corner[1], pos.z + corner[2]);
      data.normals.push(...face.normal);
      data.colors.push(r, g, b);
    }
    data.indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
}

function colorToRgb(color: number, normal: [number, number, number]): [number, number, number] {
  const shade = normal[1] > 0 ? 1.08 : normal[1] < 0 ? 0.62 : 0.86;
  return [
    (((color >> 16) & 255) / 255) * shade,
    (((color >> 8) & 255) / 255) * shade,
    ((color & 255) / 255) * shade
  ];
}
