import * as THREE from "three";
import { collides, type StarterWorld, type Vec3 } from "../domain/world";

export type InputState = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
};

export type PlayerState = {
  position: Vec3;
  yaw: number;
  pitch: number;
  velocityY: number;
  grounded: boolean;
  health: number;
  fallStartY: number | null;
};

export function makePlayer(position: Vec3): PlayerState {
  return {
    position,
    yaw: 0,
    pitch: -0.72,
    velocityY: 0,
    grounded: false,
    health: 20,
    fallStartY: null
  };
}

export function updatePlayer(world: StarterWorld, player: PlayerState, input: InputState, dt: number): void {
  const speed = 5.2;
  const forward = new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
  const right = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
  const wish = new THREE.Vector3();
  if (input.forward) wish.add(forward);
  if (input.backward) wish.sub(forward);
  if (input.right) wish.add(right);
  if (input.left) wish.sub(right);
  if (wish.lengthSq() > 0) wish.normalize().multiplyScalar(speed * dt);
  moveHorizontal(world, player, wish.x, wish.z);
  if (input.jump && player.grounded) {
    player.velocityY = 7;
    player.grounded = false;
    player.fallStartY = player.position.y;
  }
  player.velocityY -= 18 * dt;
  moveVertical(world, player, player.velocityY * dt);
}

function moveHorizontal(world: StarterWorld, player: PlayerState, dx: number, dz: number): void {
  moveAxis(world, player, dx, 0);
  moveAxis(world, player, 0, dz);
}

function moveAxis(world: StarterWorld, player: PlayerState, dx: number, dz: number): void {
  if (dx === 0 && dz === 0) return;
  const next = { ...player.position, x: player.position.x + dx, z: player.position.z + dz };
  if (!collides(world, next)) {
    player.position = next;
    return;
  }
  const stepped = { ...next, y: next.y + 0.55 };
  if (!collides(world, stepped)) {
    player.position = stepped;
  }
}

function moveVertical(world: StarterWorld, player: PlayerState, dy: number): void {
  const next = { ...player.position, y: player.position.y + dy };
  if (!collides(world, next)) {
    if (dy < 0 && player.fallStartY === null) player.fallStartY = player.position.y;
    player.position = next;
    player.grounded = false;
    return;
  }
  if (dy < 0) {
    if (player.fallStartY !== null) {
      const fallDistance = Math.max(0, player.fallStartY - player.position.y);
      if (fallDistance > 3) {
        player.health = Math.max(0, player.health - Math.ceil((fallDistance - 3) * 2));
      }
    }
    player.grounded = true;
    player.fallStartY = null;
  }
  player.velocityY = 0;
}
