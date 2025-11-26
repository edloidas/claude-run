# Claude Run - Game Architecture

## Overview

Claude Run is a browser-based 2D platformer using Phaser 3 + TypeScript + Vite, with a custom kinematic controller (no Arcade/Matter physics), Tiled for level editing, and manual tile-based collision detection.

## Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | Phaser 3 | Rendering, asset loading, input, scenes |
| Language | TypeScript | Type safety, better tooling |
| Build Tool | Vite | Fast HMR, simple deployment |
| Physics | Custom | Kinematic movement controller |
| Level Editor | Tiled | JSON export, loads via Phaser tilemaps |
| Target | Desktop browsers | 60 FPS, pixel art style |

## Why No Physics Engine

Precise platformer control requires deterministic kinematic movement. Built-in physics engines (Arcade/Matter) introduce problems:

- **Springiness**: Unwanted bounce and elasticity
- **Unpredictability**: Frame-rate dependent behavior
- **Loss of control**: Hard to implement tight platformer mechanics

Manual tile collision gives full control over:
- Coyote time (grace period after leaving platform)
- Jump buffering (press jump slightly before landing)
- One-way platforms
- Slopes (future consideration)

## Core Architecture

### Scene Management

```
BootScene → MenuScene → GameScene
     ↑______________|
```

- **BootScene**: Asset preloading, splash screen
- **MenuScene**: Title screen, level selection
- **GameScene**: Main gameplay loop

### Entity-Component Pattern

Entities are plain TypeScript classes that:
1. Hold state (position, velocity, flags)
2. Reference Phaser game objects for rendering
3. Implement `update(delta)` for game logic

```typescript
class Player {
  // State
  x: number;
  y: number;
  velocity: { x: number; y: number };
  grounded: boolean;

  // Rendering
  sprite: Phaser.GameObjects.Sprite;

  // Logic
  update(delta: number): void;
}
```

### System Architecture

Systems handle cross-cutting concerns:

| System | Responsibility |
|--------|---------------|
| InputSystem | Keyboard/gamepad input abstraction |
| CollisionSystem | Tile-based collision detection |
| CameraSystem | Camera follow, bounds |
| AudioSystem | Sound effects, music |

## Collision Detection

### Tile Collision Approach

1. **Check before move**: Query tilemap for solid tiles
2. **Resolve per-axis**: Handle X and Y separately
3. **Multi-point check**: Test corners and edges of hitbox

```typescript
// Movement resolution order
function update(delta: number) {
  // 1. Apply gravity
  this.velocity.y += GRAVITY * delta;

  // 2. Move X, resolve horizontal collision
  this.moveX(this.velocity.x * delta);

  // 3. Move Y, resolve vertical collision
  this.moveY(this.velocity.y * delta);
}
```

### Hitbox Design

- Hitbox smaller than sprite (e.g., 12x14 for 16x16 sprite)
- Check collision at key points:
  - Left edge (top, middle, bottom)
  - Right edge (top, middle, bottom)
  - Top edge (left, center, right)
  - Bottom edge (left, center, right)

## Level System

### Tiled Integration

Levels are created in Tiled Map Editor and exported as JSON.

**Layer Structure:**
- `ground` - Visual tiles (rendered)
- `collision` - Solid tiles (collision detection)
- `objects` - Spawn points, triggers, entities

**Object Properties:**
- Player spawn: `type: "player_spawn"`
- Enemy spawn: `type: "enemy_spawn"`, `enemy_type: "walker"`
- Trigger zone: `type: "trigger"`, `action: "level_end"`

### Asset Loading

```typescript
// In BootScene
preload() {
  this.load.tilemapTiledJSON('level-01', 'assets/levels/level-01.json');
  this.load.image('tileset', 'assets/tilesets/tileset.png');
}
```

## Development Phases

### Phase 1: Project Setup
- [x] Initialize Vite + TypeScript project
- [ ] Install Phaser 3
- [ ] Create basic Phaser config (no physics, pixelArt mode)
- [ ] Setup dev server and build scripts

### Phase 2: Level System
- [ ] Create sample tileset (16x16 grid)
- [ ] Build first level in Tiled
- [ ] Load tilemap in Phaser scene
- [ ] Render collision layer

### Phase 3: Player Movement
- [ ] Create player sprite
- [ ] Implement kinematic controller
- [ ] Manual tile collision detection
- [ ] Ground state tracking

### Phase 4: Precise Controls
- [ ] Jump mechanics (variable height)
- [ ] Coyote time
- [ ] Jump buffering
- [ ] Fine-tune movement constants

### Phase 5: Polish
- [ ] Player animations
- [ ] Camera follow
- [ ] Death/respawn system
- [ ] Sound effects
- [ ] Level transitions

## Configuration

### Phaser Config

```typescript
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  pixelArt: true,           // Crisp pixel rendering
  backgroundColor: '#000',
  scene: [BootScene, MenuScene, GameScene]
  // NO physics config - using custom kinematic controller
};
```

### Movement Constants

```typescript
const PLAYER_CONFIG = {
  // Horizontal movement
  MOVE_SPEED: 200,          // pixels/second
  ACCELERATION: 1500,       // pixels/second²
  FRICTION: 2000,           // pixels/second² (deceleration)

  // Vertical movement
  GRAVITY: 1200,            // pixels/second²
  JUMP_VELOCITY: -400,      // pixels/second (negative = up)
  MAX_FALL_SPEED: 600,      // pixels/second

  // Feel adjustments
  COYOTE_TIME: 100,         // milliseconds
  JUMP_BUFFER: 100,         // milliseconds
};
```

## Future Considerations

- **ECS Refactor**: If entity count grows significantly
- **One-way Platforms**: Collision only from above
- **Moving Platforms**: Kinematic entities that carry player
- **Slopes**: Tile-based or polygon collision for angled surfaces
- **Mobile Support**: Touch controls, performance optimization

## References

This architecture is inspired by tight platformers like Celeste, Super Meat Boy, and Hollow Knight - all of which use similar custom kinematic approaches for precise control.
