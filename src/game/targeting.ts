import { getBlock, type BlockPos, type StarterWorld } from "../domain/world";
import { isSolid } from "../domain/blocks";

export type TargetHit = {
  block: BlockPos;
  face: BlockPos;
  distance: number;
};

export function raycastBlock(
  world: StarterWorld,
  origin: { x: number; y: number; z: number },
  direction: { x: number; y: number; z: number },
  reach = 5
): TargetHit | null {
  let last: BlockPos | null = null;
  const step = 0.05;
  for (let distance = 0; distance <= reach; distance += step) {
    const pos = {
      x: Math.floor(origin.x + direction.x * distance),
      y: Math.floor(origin.y + direction.y * distance),
      z: Math.floor(origin.z + direction.z * distance)
    };
    if (!last || pos.x !== last.x || pos.y !== last.y || pos.z !== last.z) {
      if (isSolid(getBlock(world, pos))) {
        const face = last ?? pos;
        return { block: pos, face, distance };
      }
      last = pos;
    }
  }
  return null;
}
