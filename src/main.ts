import { mountBlockstead } from "./app";

declare global {
  interface Window {
    __blockstead?: {
      snapshot: () => import("./app").BlocksteadSnapshot;
      mineTarget: () => boolean;
      placeSelected: () => boolean;
      give: (item: import("./domain/inventory").ItemId, amount?: number) => void;
      craft: (recipe: import("./domain/inventory").RecipeId) => boolean;
      canCraft: (recipe: import("./domain/inventory").RecipeId) => boolean;
      setTimeOfDay: (timeOfDay: number) => void;
      setHealth: (health: number) => void;
      setPlayerPosition: (position: { x: number; y: number; z: number }) => void;
      tickSurvival: (dt: number) => void;
      selectHotbar: (slot: number) => void;
      blockAt: (pos: import("./domain/world").BlockPos) => import("./domain/blocks").BlockId;
      placeAt: (pos: import("./domain/world").BlockPos) => boolean;
      save: () => void;
      clearSave: () => void;
    };
  }
}

const root = document.querySelector<HTMLElement>("#app");
if (!root) throw new Error("Missing #app");

mountBlockstead(root);
