# Claude Run - AI Assistant Guide

> **Purpose**: This file documents how AI assistant is used in this game project, including workflows, preferences, and integration patterns.

## Quick Reference

### Project Context

- **Project Type**: 2D Platformer Game
- **Game Name**: Claude Run
- **Tech Stack**: Phaser 3, TypeScript, Vite
- **Physics**: Custom kinematic controller (no Arcade/Matter)
- **Level Editor**: Tiled Map Editor (JSON exports)
- **Target**: Desktop browsers, 60 FPS, pixel art style

### AI Assistant Role

- Code review and optimization suggestions
- Debugging game mechanics and collision issues
- Architecture design discussions
- Test generation for game utilities
- Game design feedback and balancing suggestions

## Coding Standards

### Rules Location

Coding standards are located in `.claude/rules/` (symlinked to `.cursor/rules/` for Cursor IDE compatibility):

- `typescript.mdc` - TypeScript coding standards
- `testing.mdc` - Testing patterns with vitest
- `comments.mdc` - Comment conventions
- `npm-scripts.mdc` - pnpm command reference
- `structure.mdc` - Game code organization and project structure

### Code Style

- **Language**: TypeScript strict mode
- **Formatting & Linting**: Biome

## Development Workflows

### Adding New Game Feature

1. Plan the feature scope and affected systems
2. Create/update entity or system classes
3. Write unit tests for utility functions
4. Manual playtest for feel and balance
5. Iterate on constants (speed, gravity, timing)

### Debugging Workflow

1. Share error logs with context
2. Identify which system is affected (collision, input, rendering)
3. Check Phaser scene lifecycle and update order
4. Use browser DevTools for performance profiling

### Level Design Workflow

1. Create/edit level in Tiled Map Editor
2. Export as JSON to `/src/assets/levels/`
3. Verify tilemap loads correctly in game
4. Test collision layer integrity

## Testing Strategy

- **Unit Tests**: vitest for utility functions (collision helpers, math utils)
- **Manual Testing**: Gameplay feel, platformer controls, level playthrough

See `.claude/rules/testing.mdc` for test patterns and examples.

## External Documentation (Context7 MCP)

Use Context7 MCP server to fetch latest docs for external libraries.

### Typical Libraries

- **Phaser 3**: scenes, sprites, tilemaps, input, game objects
- **Vite**: dev server, build config, asset handling
- **Tiled**: JSON tilemap format, object layers, tile properties

### Retrieval Guidance

- Resolve library ID first, then request focused topics
- Prefer narrow topics (e.g., "tilemaps", "keyboard input")
- Align results with our custom physics approach (not Arcade/Matter)

## Architecture Documentation

Extended documentation lives in `.claude/docs/`:

- `architecture.md` - Game architecture, tech decisions, development phases
- `game-systems.md` - Detailed system specifications and implementation patterns
