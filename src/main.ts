import { mountBlockstead } from "./app";

declare global {
  interface Window {
    __blockstead?: {
      snapshot: () => import("./app").BlocksteadSnapshot;
    };
  }
}

const root = document.querySelector<HTMLElement>("#app");
if (!root) throw new Error("Missing #app");

mountBlockstead(root);
