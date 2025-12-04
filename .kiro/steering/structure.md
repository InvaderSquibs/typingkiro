# Project Structure

## Workspace Organization

```
.kiro/
├── specs/
│   └── ghost-typing-defender/
│       └── requirements.md          # Feature requirements and acceptance criteria
├── steering/
│   ├── app-builder-rules.md         # Workshop and collaboration guidelines
│   ├── game-style-guide.md          # Visual design system and color palette
│   ├── product.md                   # Product overview
│   ├── tech.md                      # Tech stack and development guidelines
│   └── structure.md                 # This file
```

## Implementation Structure (To Be Created)

The actual game implementation structure will depend on the user's chosen language and framework. Typical organization includes:

- **Game System/Engine** — Core game loop, state management, and progression logic
- **Input Handler** — Keyboard input processing and typing validation
- **Renderer** — Visual display of game state, families, UI elements
- **Entity Management** — Family spawning, movement, and lifecycle
- **Upgrade System** — Fright points economy and house upgrades
- **Wave Controller** — Wave progression and difficulty scaling
- **Assets** — Sprites, fonts, audio files (use Kiro-logo.png if present)

## Spec Mode Workflow

When working in spec mode:
- Place nice-to-have features toward the end of tasks.md
- Complete each task, prompt user to test, gather feedback before proceeding
- Store user preferences in user-context.md steering file as they emerge

## Key Conventions

- Use the haunted house color palette from game-style-guide.md
- Maintain high contrast for accessibility
- Ensure all interactions have visual feedback
- Ask clarifying questions about scoring and character details before implementing
