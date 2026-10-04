import * as THREE from "three";
import "./styles.css";
import { makeStarterWorld, findSpawn, getBlock, setBlock, type BlockPos } from "./domain/world";
import { BLOCKS, type BlockId } from "./domain/blocks";
import {
  addItem,
  blockForItem,
  canCraft,
  consumeSelected,
  craft,
  dropForBlock,
  makeInventory,
  RECIPES,
  type Inventory,
  type ItemId,
  type RecipeId
} from "./domain/inventory";
import {
  advanceDayCycle,
  applyShadowPressure,
  isNight,
  isProtected,
  makeSurvivalState,
  respawnPosition
} from "./domain/survival";
import {
  applySave,
  loadFromStorage,
  makeSave,
  SAVE_KEY,
  saveToStorage
} from "./domain/persistence";
import { buildChunkMesh } from "./render/chunkMesh";
import { makePlayer, updatePlayer, type InputState } from "./game/player";
import { raycastBlock, type TargetHit } from "./game/targeting";

export type BlocksteadSnapshot = {
  player: { x: number; y: number; z: number; health: number };
  target: TargetHit | null;
  renderedVertices: number;
  inventory: Inventory;
  targetBlock: BlockId | null;
  survival: { timeOfDay: number; night: boolean; protected: boolean; cue: string | null; respawns: number };
};

export function mountBlockstead(root: HTMLElement): void {
  root.innerHTML = `
    <main class="game">
      <div class="hud">
        <section class="panel">
          <h1 class="title">Blockstead</h1>
          <dl class="stats">
            <div>Health <strong id="health">20</strong></div>
            <div>Target <strong id="target">none</strong></div>
            <div>Mining <strong id="mining">idle</strong></div>
            <div>Time <strong id="time">day</strong></div>
            <div>Protection <strong id="protection">exposed</strong></div>
            <div>Save <strong id="save-state">unsaved</strong></div>
            <div>Mode <strong>Slice 1</strong></div>
          </dl>
        </section>
        <section class="recipes">
          <h2>Recipes</h2>
          <div id="recipes"></div>
        </section>
        <ol id="hotbar" class="hotbar" aria-label="Hotbar"></ol>
        <div class="crosshair" aria-hidden="true"></div>
        <div class="prompt">Click to lock pointer. WASD move, Space jump. Hold left mine, right place.</div>
      </div>
    </main>
  `;
  const host = root.querySelector<HTMLElement>(".game");
  if (!host) throw new Error("Missing game host");

  const world = makeStarterWorld(4109);
  const inventory = makeInventory();
  const survival = makeSurvivalState();
  addItem(inventory, "dirt", 4);
  const player = makePlayer(findSpawn(world));
  const saved = loadFromStorage(localStorage);
  if (saved) applySave(saved, world, player, inventory, survival);
  const input: InputState = { forward: false, backward: false, left: false, right: false, jump: false };
  const pointer = { mining: false };
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9fc6dd);
  scene.fog = new THREE.Fog(0x9fc6dd, 28, 90);
  const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.05, 220);
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  host.prepend(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xd9ecff, 0x4b3a2d, 2.4));
  const sun = new THREE.DirectionalLight(0xfff2cf, 2.1);
  sun.position.set(-10, 18, 8);
  scene.add(sun);

  let renderedVertices = 0;
  const chunkMeshes = new Map<string, THREE.Mesh>();
  for (let chunkX = -2; chunkX <= 1; chunkX += 1) {
    for (let chunkZ = -2; chunkZ <= 1; chunkZ += 1) {
      const mesh = createChunkObject(world, chunkX, chunkZ);
      renderedVertices += mesh.geometry.getAttribute("position").count;
      chunkMeshes.set(chunkKey(chunkX, chunkZ), mesh);
      scene.add(mesh);
    }
  }

  const targetBox = new THREE.Box3Helper(new THREE.Box3(), 0xf6f1a1);
  targetBox.visible = false;
  scene.add(targetBox);

  const health = root.querySelector<HTMLElement>("#health");
  const target = root.querySelector<HTMLElement>("#target");
  const mining = root.querySelector<HTMLElement>("#mining");
  const time = root.querySelector<HTMLElement>("#time");
  const protection = root.querySelector<HTMLElement>("#protection");
  const saveState = root.querySelector<HTMLElement>("#save-state");
  const hotbar = root.querySelector<HTMLElement>("#hotbar");
  const recipes = root.querySelector<HTMLElement>("#recipes");
  let last = performance.now();
  let currentTarget: TargetHit | null = null;
  let miningProgress = 0;
  let miningBlockKey: string | null = null;
  let audioContext: AudioContext | null = null;

  host.addEventListener("click", () => {
    renderer.domElement.requestPointerLock().catch(() => undefined);
    audioContext ??= new AudioContext();
  });
  host.addEventListener("contextmenu", (event) => event.preventDefault());
  host.addEventListener("mousedown", (event) => {
    if (event.button === 0) pointer.mining = true;
    if (event.button === 2) placeSelected();
  });
  window.addEventListener("mouseup", (event) => {
    if (event.button === 0) {
      pointer.mining = false;
      miningProgress = 0;
      miningBlockKey = null;
    }
  });
  document.addEventListener("pointerlockchange", () => {
    document.body.classList.toggle("locked", document.pointerLockElement === renderer.domElement);
  });
  document.addEventListener("mousemove", (event) => {
    if (document.pointerLockElement !== renderer.domElement) return;
    player.yaw -= event.movementX * 0.0022;
    player.pitch = Math.max(-1.35, Math.min(1.2, player.pitch - event.movementY * 0.0022));
  });
  window.addEventListener("keydown", (event) => setKey(input, event.code, true));
  window.addEventListener("keyup", (event) => setKey(input, event.code, false));
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function frame(now: number): void {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    updatePlayer(world, player, input, dt);
    advanceDayCycle(survival, dt);
    const nextHealth = applyShadowPressure(world, player.position, player.health, survival.timeOfDay, dt);
    if (nextHealth < player.health) playCue("damage");
    player.health = nextHealth;
    if (player.health <= 0) {
      player.position = respawnPosition(world);
      player.velocityY = 0;
      player.health = 20;
      survival.respawns += 1;
      playCue("respawn");
    }
    camera.position.set(player.position.x, player.position.y + 1.62, player.position.z);
    camera.rotation.order = "YXZ";
    camera.rotation.y = player.yaw;
    camera.rotation.x = player.pitch;
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    currentTarget = raycastBlock(world, camera.position, dir, 5);
    updateTargetBox(targetBox, currentTarget);
    tickMining(dt);
    if (health) health.textContent = String(player.health);
    if (target) {
      target.textContent = currentTarget
        ? `${currentTarget.block.x},${currentTarget.block.y},${currentTarget.block.z}`
        : "none";
    }
    if (mining) mining.textContent = miningProgress > 0 ? `${Math.round(miningProgress * 100)}%` : "idle";
    if (time) time.textContent = isNight(survival.timeOfDay) ? "night" : "day";
    if (protection) protection.textContent = isProtected(world, player.position) ? "protected" : "exposed";
    if (saveState) saveState.textContent = localStorage.getItem(SAVE_KEY) ? "saved" : "unsaved";
    renderHotbar(hotbar, inventory);
    renderRecipes(recipes, inventory);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  window.__blockstead = {
    snapshot: () => ({
      player: { ...player.position, health: player.health },
      target: currentTarget,
      renderedVertices,
      inventory: structuredClone(inventory),
      targetBlock: currentTarget ? getBlock(world, currentTarget.block) : null,
      survival: {
        timeOfDay: survival.timeOfDay,
        night: isNight(survival.timeOfDay),
        protected: isProtected(world, player.position),
        cue: survival.lastCue,
        respawns: survival.respawns
      }
    }),
    mineTarget,
    placeSelected,
    give: (item: ItemId, amount = 1) => addItem(inventory, item, amount),
    craft: (recipe: RecipeId) => craft(inventory, recipe),
    canCraft: (recipe: RecipeId) => canCraft(inventory, recipe),
    setTimeOfDay: (timeOfDay: number) => {
      survival.timeOfDay = ((timeOfDay % 1) + 1) % 1;
    },
    setHealth: (health: number) => {
      player.health = Math.max(0, health);
    },
    setPlayerPosition: (position: { x: number; y: number; z: number }) => {
      player.position = position;
      player.velocityY = 0;
    },
    tickSurvival: (dt: number) => {
      advanceDayCycle(survival, dt);
      player.health = applyShadowPressure(world, player.position, player.health, survival.timeOfDay, dt);
      if (player.health <= 0) {
        player.position = respawnPosition(world);
        player.health = 20;
        survival.respawns += 1;
        playCue("respawn");
      }
    },
    selectHotbar: (slot: number) => {
      inventory.selected = Math.max(0, Math.min(inventory.hotbar.length - 1, slot));
    },
    blockAt: (pos: BlockPos) => getBlock(world, pos),
    placeAt: (pos: BlockPos) => placeSelectedAt(pos),
    save: () => saveToStorage(localStorage, makeSave(world, player, inventory, survival)),
    clearSave: () => localStorage.removeItem(SAVE_KEY)
  };

  function tickMining(dt: number): void {
    if (!pointer.mining || !currentTarget) {
      miningProgress = 0;
      miningBlockKey = null;
      return;
    }
    const key = `${currentTarget.block.x},${currentTarget.block.y},${currentTarget.block.z}`;
    if (miningBlockKey !== key) {
      miningBlockKey = key;
      miningProgress = 0;
    }
    const block = getBlock(world, currentTarget.block);
    const breakTime = BLOCKS[block].breakTime;
    if (breakTime <= 0) return;
    miningProgress += dt / breakTime;
    if (miningProgress >= 1) {
      mineTarget();
      miningProgress = 0;
      miningBlockKey = null;
    }
  }

  function mineTarget(): boolean {
    if (!currentTarget) return false;
    const block = getBlock(world, currentTarget.block);
    if (block === "air") return false;
    const drop = dropForBlock(block);
    setBlock(world, currentTarget.block, "air");
    if (drop) addItem(inventory, drop);
    playCue("break");
    rebuildChunkFor(currentTarget.block);
    return true;
  }

  function placeSelected(): boolean {
    if (!currentTarget) return false;
    return placeSelectedAt(currentTarget.face);
  }

  function placeSelectedAt(pos: BlockPos): boolean {
    const item = consumeSelected(inventory);
    if (!item) return false;
    const block = blockForItem(item);
    if (!block) {
      addItem(inventory, item);
      return false;
    }
    setBlock(world, pos, block);
    playCue(block === "torch" ? "torch" : "place");
    rebuildChunkFor(pos);
    return true;
  }

  function rebuildChunkFor(pos: BlockPos): void {
    const chunkX = Math.floor(pos.x / 16);
    const chunkZ = Math.floor(pos.z / 16);
    const key = chunkKey(chunkX, chunkZ);
    const old = chunkMeshes.get(key);
    if (old) {
      scene.remove(old);
      old.geometry.dispose();
      if (Array.isArray(old.material)) {
        old.material.forEach((material) => material.dispose());
      } else {
        old.material.dispose();
      }
    }
    const mesh = createChunkObject(world, chunkX, chunkZ);
    chunkMeshes.set(key, mesh);
    scene.add(mesh);
    renderedVertices = Array.from(chunkMeshes.values()).reduce(
      (total, chunk) => total + chunk.geometry.getAttribute("position").count,
      0
    );
  }

  function playCue(cue: string): void {
    survival.lastCue = cue;
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const frequency = cue === "damage" ? 120 : cue === "respawn" ? 260 : cue === "torch" ? 520 : 360;
    oscillator.frequency.value = frequency;
    oscillator.type = "triangle";
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.12);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.14);
  }
}

function createChunkObject(world: ReturnType<typeof makeStarterWorld>, chunkX: number, chunkZ: number): THREE.Mesh {
  const data = buildChunkMesh(world, chunkX, chunkZ);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(data.positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(data.normals, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(data.colors, 3));
  geometry.setIndex(data.indices);
  geometry.computeBoundingSphere();
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92 });
  return new THREE.Mesh(geometry, material);
}

function setKey(input: InputState, code: string, pressed: boolean): void {
  if (code === "KeyW") input.forward = pressed;
  if (code === "KeyS") input.backward = pressed;
  if (code === "KeyA") input.left = pressed;
  if (code === "KeyD") input.right = pressed;
  if (code === "Space") input.jump = pressed;
  if (/^Digit[1-5]$/.test(code) && pressed) {
    const slot = Number(code.replace("Digit", "")) - 1;
    window.__blockstead?.selectHotbar(slot);
  }
}

function updateTargetBox(helper: THREE.Box3Helper, target: TargetHit | null): void {
  if (!target) {
    helper.visible = false;
    return;
  }
  helper.visible = true;
  helper.box.min.set(target.block.x, target.block.y, target.block.z);
  helper.box.max.set(target.block.x + 1, target.block.y + 1, target.block.z + 1);
}

function renderHotbar(host: HTMLElement | null, inventory: Inventory): void {
  if (!host) return;
  host.innerHTML = inventory.hotbar
    .map((item, index) => {
      const active = index === inventory.selected ? " active" : "";
      return `<li class="hotbar-slot${active}"><span>${index + 1}</span><strong>${item}</strong><em>${inventory.counts[item]}</em></li>`;
    })
    .join("");
}

function renderRecipes(host: HTMLElement | null, inventory: Inventory): void {
  if (!host) return;
  host.innerHTML = RECIPES.map((recipe) => {
    const affordable = canCraft(inventory, recipe.id);
    const cost = Object.entries(recipe.inputs)
      .map(([item, amount]) => `${amount} ${item}`)
      .join(", ");
    return `<button class="recipe" data-affordable="${affordable}" disabled>${recipe.label}<span>${cost}</span></button>`;
  }).join("");
}

function chunkKey(chunkX: number, chunkZ: number): string {
  return `${chunkX},${chunkZ}`;
}
