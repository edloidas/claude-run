# Claude Run - Game Systems

## Overview

This document details the core game systems that power Claude Run. Each system is designed for modularity, testability, and tight platformer feel.

## Player Movement System

### Core Movement

The player uses a kinematic controller with manual collision resolution.

#### Horizontal Movement

```typescript
// Input processing
if (InputSystem.isKeyDown('left')) {
  targetVelocityX = -MOVE_SPEED;
} else if (InputSystem.isKeyDown('right')) {
  targetVelocityX = MOVE_SPEED;
} else {
  targetVelocityX = 0;
}

// Acceleration/deceleration
if (targetVelocityX !== 0) {
  // Accelerate toward target
  velocity.x = approach(velocity.x, targetVelocityX, ACCELERATION * delta);
} else {
  // Apply friction
  velocity.x = approach(velocity.x, 0, FRICTION * delta);
}
```

#### Vertical Movement (Gravity & Jump)

```typescript
// Apply gravity
velocity.y += GRAVITY * delta;
velocity.y = Math.min(velocity.y, MAX_FALL_SPEED);

// Jump input
if (InputSystem.isKeyPressed('jump') && canJump()) {
  velocity.y = JUMP_VELOCITY;
  grounded = false;
}

// Variable jump height (release early = shorter jump)
if (InputSystem.isKeyReleased('jump') && velocity.y < 0) {
  velocity.y *= 0.5; // Cut upward velocity
}
```

### Movement Feel Enhancements

#### Coyote Time

Allow jumping briefly after walking off a platform.

```typescript
let coyoteTimer = 0;

function update(delta: number) {
  if (grounded) {
    coyoteTimer = COYOTE_TIME;
  } else {
    coyoteTimer -= delta;
  }
}

function canJump(): boolean {
  return grounded || coyoteTimer > 0;
}
```

#### Jump Buffering

Remember jump input slightly before landing.

```typescript
let jumpBufferTimer = 0;

function update(delta: number) {
  if (InputSystem.isKeyPressed('jump')) {
    jumpBufferTimer = JUMP_BUFFER_TIME;
  } else {
    jumpBufferTimer -= delta;
  }

  if (grounded && jumpBufferTimer > 0) {
    performJump();
    jumpBufferTimer = 0;
  }
}
```

### Movement Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `MOVE_SPEED` | 200 px/s | Target horizontal velocity |
| `ACCELERATION` | 1500 px/s² | How fast player reaches move speed |
| `FRICTION` | 2000 px/s² | How fast player stops when no input |
| `GRAVITY` | 1200 px/s² | Downward acceleration |
| `JUMP_VELOCITY` | -400 px/s | Initial upward velocity |
| `MAX_FALL_SPEED` | 600 px/s | Terminal velocity |
| `COYOTE_TIME` | 100 ms | Grace period after leaving ground |
| `JUMP_BUFFER` | 100 ms | Input buffer before landing |

---

## Collision Detection System

### Tile Collision

Uses Phaser's tilemap API with manual collision resolution.

#### Basic Tile Check

```typescript
function isSolidAt(layer: TilemapLayer, x: number, y: number): boolean {
  const tile = layer.getTileAtWorldXY(x, y);
  return tile !== null && tile.index !== -1;
}
```

#### Multi-Point Collision

Check multiple points on entity bounds for accurate collision.

```typescript
function checkHorizontalCollision(
  layer: TilemapLayer,
  entity: Entity,
  direction: 'left' | 'right'
): boolean {
  const edgeX = direction === 'left'
    ? entity.x
    : entity.x + entity.width;

  // Check three points along vertical edge
  const points = [
    { x: edgeX, y: entity.y + 2 },                    // Top
    { x: edgeX, y: entity.y + entity.height / 2 },   // Middle
    { x: edgeX, y: entity.y + entity.height - 2 },   // Bottom
  ];

  return points.some(p => isSolidAt(layer, p.x, p.y));
}
```

#### Movement Resolution

```typescript
function moveX(entity: Entity, layer: TilemapLayer, amount: number): void {
  entity.x += amount;

  if (amount > 0 && checkHorizontalCollision(layer, entity, 'right')) {
    // Snap to tile edge
    entity.x = Math.floor(entity.x / TILE_SIZE) * TILE_SIZE + (TILE_SIZE - entity.width);
    entity.velocity.x = 0;
  } else if (amount < 0 && checkHorizontalCollision(layer, entity, 'left')) {
    entity.x = Math.ceil(entity.x / TILE_SIZE) * TILE_SIZE;
    entity.velocity.x = 0;
  }
}

function moveY(entity: Entity, layer: TilemapLayer, amount: number): void {
  entity.y += amount;

  if (amount > 0 && checkVerticalCollision(layer, entity, 'bottom')) {
    entity.y = Math.floor(entity.y / TILE_SIZE) * TILE_SIZE + (TILE_SIZE - entity.height);
    entity.velocity.y = 0;
    entity.grounded = true;
  } else if (amount < 0 && checkVerticalCollision(layer, entity, 'top')) {
    entity.y = Math.ceil(entity.y / TILE_SIZE) * TILE_SIZE;
    entity.velocity.y = 0;
  } else {
    entity.grounded = false;
  }
}
```

---

## Level Loading System

### Tilemap Structure

Levels are created in Tiled and exported as JSON.

#### Required Layers

| Layer Name | Type | Purpose |
|------------|------|---------|
| `ground` | Tile Layer | Visual tiles (decoration) |
| `collision` | Tile Layer | Solid tiles for collision |
| `background` | Tile Layer | Background decoration |
| `objects` | Object Layer | Spawn points, triggers |

#### Object Types

```typescript
type ObjectType =
  | 'player_spawn'
  | 'enemy_spawn'
  | 'checkpoint'
  | 'trigger'
  | 'collectible';

interface TiledObject {
  id: number;
  name: string;
  type: ObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  properties?: Record<string, unknown>;
}
```

### Loading Process

```typescript
class GameScene extends Phaser.Scene {
  private tilemap!: Phaser.Tilemaps.Tilemap;
  private collisionLayer!: Phaser.Tilemaps.TilemapLayer;

  create() {
    // Load tilemap
    this.tilemap = this.make.tilemap({ key: 'level-01' });
    const tileset = this.tilemap.addTilesetImage('tileset', 'tileset-image');

    // Create layers
    this.tilemap.createLayer('background', tileset);
    this.tilemap.createLayer('ground', tileset);
    this.collisionLayer = this.tilemap.createLayer('collision', tileset);

    // Process objects
    const objects = this.tilemap.getObjectLayer('objects');
    this.processObjects(objects.objects);
  }

  processObjects(objects: Phaser.Types.Tilemaps.TiledObject[]) {
    for (const obj of objects) {
      switch (obj.type) {
        case 'player_spawn':
          this.spawnPlayer(obj.x, obj.y);
          break;
        case 'enemy_spawn':
          this.spawnEnemy(obj);
          break;
        // ... other types
      }
    }
  }
}
```

---

## Camera System

### Camera Follow

```typescript
class GameScene extends Phaser.Scene {
  setupCamera() {
    // Set world bounds from tilemap
    this.cameras.main.setBounds(
      0, 0,
      this.tilemap.widthInPixels,
      this.tilemap.heightInPixels
    );

    // Follow player with deadzone
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(100, 50);
  }
}
```

### Camera Shake (On Hit/Death)

```typescript
function onPlayerHit() {
  this.cameras.main.shake(200, 0.01);
}
```

---

## Input System

### Keyboard Input Abstraction

```typescript
class InputSystem {
  private static keys: Map<string, Phaser.Input.Keyboard.Key> = new Map();

  static init(scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard!;
    this.keys.set('left', keyboard.addKey('A'));
    this.keys.set('right', keyboard.addKey('D'));
    this.keys.set('jump', keyboard.addKey('SPACE'));
    this.keys.set('up', keyboard.addKey('W'));
    this.keys.set('down', keyboard.addKey('S'));
  }

  static isKeyDown(key: string): boolean {
    return this.keys.get(key)?.isDown ?? false;
  }

  static isKeyPressed(key: string): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.get(key)!);
  }

  static isKeyReleased(key: string): boolean {
    return Phaser.Input.Keyboard.JustUp(this.keys.get(key)!);
  }
}
```

### Key Bindings

| Action | Primary | Alternative |
|--------|---------|-------------|
| Move Left | A | Arrow Left |
| Move Right | D | Arrow Right |
| Jump | Space | W / Arrow Up |
| Crouch/Drop | S | Arrow Down |

---

## Future Systems

### Enemy AI System

- Patrol behavior (walk between points)
- Chase behavior (follow player when in range)
- Attack patterns

### One-Way Platforms

- Collision only when falling from above
- Drop-through with down + jump

### Moving Platforms

- Kinematic platforms that carry entities
- Velocity transfer to player

### Checkpoint System

- Save player position on checkpoint touch
- Respawn at last checkpoint on death
