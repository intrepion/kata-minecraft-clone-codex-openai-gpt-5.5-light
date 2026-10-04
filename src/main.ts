import { mountBlockstead } from "./app";

declare global {
  interface Window {
    __blockstead?: {
      snapshot: () => import("./app").BlocksteadSnapshot;
      mineTarget: () => boolean;
      placeSelected: () => boolean;
      give: (item: import("./domain/inventory").ItemId, amount?: number) => void;
      selectHotbar: (slot: number) => void;
      blockAt: (pos: import("./domain/world").BlockPos) => import("./domain/blocks").BlockId;
      placeAt: (pos: import("./domain/world").BlockPos) => boolean;
    };
  }
}

const root = document.querySelector<HTMLElement>("#app");
if (!root) throw new Error("Missing #app");

mountBlockstead(root);
