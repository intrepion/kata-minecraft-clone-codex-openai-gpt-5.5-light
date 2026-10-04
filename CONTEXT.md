# Voxel Survival Sandbox

This browser-first voxel survival sandbox is inspired by the first-night loop of Minecraft. Its domain language centers on editable terrain, player-made shelter, lightweight survival pressure, crafting, and persistent world changes.

## Language

**First-Night Loop**:
The initial survival arc where the player spawns, gathers wood, crafts basic tools, shapes terrain, builds a shelter, lights it, survives night pressure, and reloads into the same altered world.
_Avoid_: Tutorial loop, starter mission

**Voxel World**:
The editable block environment the player inhabits, mines, places into, saves, and reloads.
_Avoid_: Map, level, scene

**Chunk**:
A bounded region of the Voxel World used to organize terrain, block edits, persistence, and rendering.
_Avoid_: Region, tile group, sector

**Block Edit**:
A persistent player change to the Voxel World caused by mining or placing a block.
_Avoid_: Terrain mutation, voxel delta

**Survival Spine**:
The minimum playable structure that makes shelter and resource gathering matter: health, fall damage, day/night progression, and a simple night threat.
_Avoid_: Survival mode, combat mode

**Night Threat**:
A lightweight hostile pressure that makes exposed nighttime play risky and gives shelters practical value.
_Avoid_: Mob system, enemy AI

**Shelter**:
A player-built enclosed or protected space that helps the player survive night pressure.
_Avoid_: Base, house, fort

**Resource Block**:
A mineable block that contributes to crafting or survival progression.
_Avoid_: Material node, gatherable

**Crafting Table**:
A placed utility block that unlocks the first meaningful recipe expansion beyond inventory-only crafting.
_Avoid_: Workbench, maker block

**Torch**:
A placed light source used to make darkness legible and support safe shelter during the night.
_Avoid_: Light, lamp

**Local World Save**:
The browser-persisted state containing player position, inventory, and Block Edits across reloads.
_Avoid_: Save game, profile, checkpoint
