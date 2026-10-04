import { type BlockId, isSolid } from "./blocks";

export const CHUNK_SIZE = 16;
export const WORLD_MIN_Y = 0;
export const WORLD_MAX_Y = 24;
export const STARTER_RADIUS = 32;

export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export type BlockPos = {
  x: number;
  y: number;
  z: number;
};

export type StarterWorld = {
  seed: number;
  edits: Map<string, BlockId>;
};

export function makeStarterWorld(seed = 4109): StarterWorld {
  return { seed, edits: new Map() };
}

export function blockKey(pos: BlockPos): string {
  return `${pos.x},${pos.y},${pos.z}`;
}

export function getBlock(world: StarterWorld, pos: BlockPos): BlockId {
  if (pos.y < WORLD_MIN_Y || pos.y > WORLD_MAX_Y) return "air";
  const edited = world.edits.get(blockKey(pos));
  if (edited) return edited;
  return generatedBlock(world.seed, pos);
}

export function setBlock(world: StarterWorld, pos: BlockPos, block: BlockId): void {
  world.edits.set(blockKey(pos), block);
}

export function isSolidAt(world: StarterWorld, pos: BlockPos): boolean {
  return isSolid(getBlock(world, pos));
}

export function surfaceHeight(seed: number, x: number, z: number): number {
  const hill =
    7 +
    Math.sin((x + seed * 0.01) * 0.19) * 2.4 +
    Math.cos((z - seed * 0.02) * 0.16) * 2.1 +
    Math.sin((x + z) * 0.08) * 1.6;
  const caveDip = Math.max(0, 5 - Math.hypot(x + 9, z - 7)) * 0.7;
  return Math.max(3, Math.round(hill - caveDip));
}

export function generatedBlock(seed: number, pos: BlockPos): BlockId {
  if (Math.abs(pos.x) > STARTER_RADIUS || Math.abs(pos.z) > STARTER_RADIUS) {
    return "air";
  }
  const height = surfaceHeight(seed, pos.x, pos.z);
  const caveMouth = pos.x >= -12 && pos.x <= -5 && pos.z >= 4 && pos.z <= 10 && pos.y >= 4 && pos.y <= 7;
  if (caveMouth) return "air";
  if (treeBlock(pos, seed) === "log") return "log";
  if (treeBlock(pos, seed) === "leaves") return "leaves";
  if (pos.y > height) return "air";
  if (pos.y === height) return "grass";
  if (pos.y > height - 3) return "dirt";
  if (coalPocket(pos)) return "coalOre";
  return "stone";
}

export function treeBlock(pos: BlockPos, seed: number): BlockId | "none" {
  const trunks = [
    { x: -13, z: -10, h: 4 },
    { x: -4, z: -15, h: 5 },
    { x: 7, z: -11, h: 4 },
    { x: 14, z: 1, h: 5 },
    { x: -16, z: 12, h: 4 },
    { x: 4, z: 15, h: 5 }
  ];
  for (const trunk of trunks) {
    const ground = surfaceHeight(seed, trunk.x, trunk.z);
    if (pos.x === trunk.x && pos.z === trunk.z && pos.y > ground && pos.y <= ground + trunk.h) {
      return "log";
    }
    const crownY = ground + trunk.h + 1;
    const spread = Math.abs(pos.x - trunk.x) + Math.abs(pos.z - trunk.z) + Math.abs(pos.y - crownY);
    if (spread <= 4 && pos.y >= crownY - 2 && pos.y <= crownY + 2) return "leaves";
  }
  return "none";
}

function coalPocket(pos: BlockPos): boolean {
  return (
    (pos.x >= -3 && pos.x <= 1 && pos.z >= 9 && pos.z <= 12 && pos.y >= 3 && pos.y <= 5) ||
    (pos.x >= 10 && pos.x <= 13 && pos.z >= -4 && pos.z <= -1 && pos.y >= 4 && pos.y <= 6)
  );
}

export function collides(world: StarterWorld, center: Vec3): boolean {
  const radius = 0.32;
  const minX = Math.floor(center.x - radius);
  const maxX = Math.floor(center.x + radius);
  const minY = Math.floor(center.y);
  const maxY = Math.floor(center.y + 1.75);
  const minZ = Math.floor(center.z - radius);
  const maxZ = Math.floor(center.z + radius);
  for (let x = minX; x <= maxX; x += 1) {
    for (let y = minY; y <= maxY; y += 1) {
      for (let z = minZ; z <= maxZ; z += 1) {
        if (isSolidAt(world, { x, y, z })) return true;
      }
    }
  }
  return false;
}

export function findSpawn(world: StarterWorld): Vec3 {
  const x = 0;
  const z = -3;
  return { x: x + 0.5, y: surfaceHeight(world.seed, x, z) + 1, z: z + 0.5 };
}
