import { applyEdits, serializeEdits, type StarterWorld, type Vec3 } from "./world";
import { type Inventory } from "./inventory";
import { type SurvivalState } from "./survival";
import { type BlockId } from "./blocks";

export const SAVE_KEY = "blockstead.localWorldSave.v1";

export type LocalWorldSave = {
  seed: number;
  player: { position: Vec3; health: number };
  inventory: Inventory;
  survival: SurvivalState;
  edits: [string, BlockId][];
};

export function makeSave(
  world: StarterWorld,
  player: { position: Vec3; health: number },
  inventory: Inventory,
  survival: SurvivalState
): LocalWorldSave {
  return {
    seed: world.seed,
    player: { position: { ...player.position }, health: player.health },
    inventory: structuredClone(inventory),
    survival: structuredClone(survival),
    edits: serializeEdits(world)
  };
}

export function applySave(
  save: LocalWorldSave,
  world: StarterWorld,
  player: { position: Vec3; health: number },
  inventory: Inventory,
  survival: SurvivalState
): void {
  applyEdits(world, save.edits);
  player.position = { ...save.player.position };
  player.health = save.player.health;
  inventory.selected = save.inventory.selected;
  inventory.hotbar = [...save.inventory.hotbar];
  inventory.counts = { ...save.inventory.counts };
  survival.timeOfDay = save.survival.timeOfDay;
  survival.lastCue = save.survival.lastCue;
  survival.respawns = save.survival.respawns;
}

export function saveToStorage(storage: Storage, save: LocalWorldSave): void {
  storage.setItem(SAVE_KEY, JSON.stringify(save));
}

export function loadFromStorage(storage: Storage): LocalWorldSave | null {
  const raw = storage.getItem(SAVE_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as LocalWorldSave;
}
