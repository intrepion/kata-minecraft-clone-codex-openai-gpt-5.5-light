# Blockstead

Blockstead is a browser-first voxel survival sandbox inspired by the first-night loop of Minecraft. Its domain language centers on editable terrain, player-made shelter, lightweight survival pressure, crafting, and persistent world changes.

## Language

**First-Night Loop**:
The initial survival arc where the player spawns, gathers wood, crafts basic tools, shapes terrain, builds a shelter, lights it, survives night pressure, and reloads into the same altered world.
_Avoid_: Tutorial loop, starter mission

**Slice**:
An independently playable implementation stage that proves one part of the First-Night Loop without depending on unfinished later systems.
_Avoid_: Phase, milestone, sprint

**Voxel World**:
The editable block environment the player inhabits, mines, places into, saves, and reloads.
_Avoid_: Map, level, scene

**Starter Valley**:
The bounded initial Voxel World shape with hills, trees, exposed stone, coal pockets, and a cave mouth.
_Avoid_: Spawn area, tutorial map, first biome

**Chunk**:
A bounded region of the Voxel World used to organize terrain, block edits, persistence, and rendering.
_Avoid_: Region, tile group, sector

**Block Edit**:
A persistent player change to the Voxel World caused by mining or placing a block.
_Avoid_: Terrain mutation, voxel delta

**Player Capsule**:
The player's simple standing collision body for walking, jumping, falling, step-up movement, and block interaction.
_Avoid_: Character controller, physics body, avatar

**Target Face**:
The highlighted block face selected by the player's reach ray and used as the placement anchor for a new block.
_Avoid_: Cursor target, selection, hit face

**Reach**:
The limited first-person interaction distance for mining a block or placing against a Target Face.
_Avoid_: Range, interaction distance

**Break Time**:
The time required to mine a Resource Block, based on the block and currently held tool.
_Avoid_: Mining speed, harvest delay

**Survival Spine**:
The minimum playable structure that makes shelter and resource gathering matter: health, fall damage, day/night progression, and a simple night threat.
_Avoid_: Survival mode, combat mode

**Night Threat**:
A lightweight hostile pressure that makes exposed nighttime play risky and gives shelters practical value.
_Avoid_: Mob system, enemy AI

**Shadow Pressure**:
The first Night Threat: darkness and exposure drain player health unless the player is protected by torchlight or sufficient shelter.
_Avoid_: Monster attack, darkness damage

**Shelter**:
A player-built enclosed or protected space that helps the player survive night pressure.
_Avoid_: Base, house, fort

**Resource Block**:
A mineable block that contributes to crafting or survival progression.
_Avoid_: Material node, gatherable

**Crafting Table**:
A placed utility block that unlocks the first meaningful recipe expansion beyond inventory-only crafting.
_Avoid_: Workbench, maker block

**Hotbar**:
The quick-access inventory row used to select placeable blocks, tools, and torches during first-person play.
_Avoid_: Toolbar, quick slots

**Backpack**:
The compact count-based inventory storage beyond the Hotbar.
_Avoid_: Inventory grid, bag

**Recipe List**:
The MVP crafting interface where available recipes are selected directly from known inputs rather than assembled in a spatial crafting grid.
_Avoid_: Crafting grid, recipe book

**Torch**:
A placed light source used to make darkness legible and support safe shelter during the night.
_Avoid_: Light, lamp

**Day Cycle**:
The repeating daylight-to-night rhythm that controls visibility and when Shadow Pressure becomes dangerous.
_Avoid_: Time system, clock

**Respawn**:
The MVP recovery after health reaches zero, returning the player to the Starter Valley spawn while retaining inventory.
_Avoid_: Death reset, reload, revive

**Local World Save**:
The browser-persisted state containing player position, inventory, and Block Edits across reloads.
_Avoid_: Save game, profile, checkpoint
