import { findSpawn, isSolidAt, type StarterWorld, type Vec3, type BlockPos, getBlock } from "./world";

export const DAY_LENGTH_SECONDS = 480;
export const SHADOW_DRAIN_PER_SECOND = 1.5;

export type SurvivalState = {
  timeOfDay: number;
  lastCue: string | null;
  respawns: number;
};

export function makeSurvivalState(): SurvivalState {
  return { timeOfDay: 0.2, lastCue: null, respawns: 0 };
}

export function isNight(timeOfDay: number): boolean {
  return timeOfDay >= 0.58 || timeOfDay <= 0.08;
}

export function advanceDayCycle(state: SurvivalState, dt: number): void {
  const wasNight = isNight(state.timeOfDay);
  state.timeOfDay = (state.timeOfDay + dt / DAY_LENGTH_SECONDS) % 1;
  const nowNight = isNight(state.timeOfDay);
  if (wasNight !== nowNight) state.lastCue = nowNight ? "night" : "day";
}

export function hasTorchProtection(world: StarterWorld, position: Vec3): boolean {
  const radius = 7;
  const base = toBlockPos(position);
  for (let x = base.x - radius; x <= base.x + radius; x += 1) {
    for (let y = base.y - 2; y <= base.y + 3; y += 1) {
      for (let z = base.z - radius; z <= base.z + radius; z += 1) {
        if (Math.hypot(x - base.x, z - base.z) <= radius && getBlock(world, { x, y, z }) === "torch") {
          return true;
        }
      }
    }
  }
  return false;
}

export function hasShelterProtection(world: StarterWorld, position: Vec3): boolean {
  const base = toBlockPos(position);
  let hasRoof = false;
  for (let y = base.y + 2; y <= base.y + 5; y += 1) {
    if (isSolidAt(world, { x: base.x, y, z: base.z })) {
      hasRoof = true;
      break;
    }
  }
  if (!hasRoof) return false;
  const sides: BlockPos[] = [
    { x: base.x + 1, y: base.y + 1, z: base.z },
    { x: base.x - 1, y: base.y + 1, z: base.z },
    { x: base.x, y: base.y + 1, z: base.z + 1 },
    { x: base.x, y: base.y + 1, z: base.z - 1 }
  ];
  return sides.filter((side) => isSolidAt(world, side)).length >= 3;
}

export function isProtected(world: StarterWorld, position: Vec3): boolean {
  return hasTorchProtection(world, position) || hasShelterProtection(world, position);
}

export function applyShadowPressure(
  world: StarterWorld,
  position: Vec3,
  health: number,
  timeOfDay: number,
  dt: number
): number {
  if (!isNight(timeOfDay) || isProtected(world, position)) return health;
  return Math.max(0, health - SHADOW_DRAIN_PER_SECOND * dt);
}

export function respawnPosition(world: StarterWorld): Vec3 {
  return findSpawn(world);
}

function toBlockPos(position: Vec3): BlockPos {
  return { x: Math.floor(position.x), y: Math.floor(position.y), z: Math.floor(position.z) };
}
