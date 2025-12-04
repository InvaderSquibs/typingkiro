# Design Document

## Overview

Ghost Typing Defender is a tower defense typing game built around a core game loop where players type words to scare away families before they reach the haunted house. The architecture separates concerns into distinct systems: game state management, input processing, entity lifecycle, rendering, and upgrade progression. The design emphasizes responsive input handling (sub-frame latency), smooth 60 FPS rendering, and a visual progression system where house upgrades manifest as distinct visual elements on the house structure.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Game Loop                             │
│  (60 FPS target, delta time-based updates)                  │
└────────────┬────────────────────────────────┬───────────────┘
             │                                │
    ┌────────▼────────┐              ┌───────▼────────┐
    │  Input System   │              │  Game State    │
    │  - Key events   │              │  - Health      │
    │  - Input queue  │              │  - Points      │
    │  - Target mgmt  │              │  - Wave #      │
    └────────┬────────┘              │  - Upgrades    │
             │                       └───────┬────────┘
             │                               │
    ┌────────▼───────────────────────────────▼────────┐
    │            Entity Manager                        │
    │  - Family spawning & lifecycle                   │
    │  - Position updates                              │
    │  - Damage calculation                            │
    └────────┬─────────────────────────────────────────┘
             │
    ┌────────▼────────┐              ┌─────────────────┐
    │  Wave System    │              │  Upgrade System │
    │  - Spawn config │              │  - Purchase     │
    │  - Difficulty   │              │  - Effects      │
    │  - Transitions  │              │  - Visuals      │
    └────────┬────────┘              └────────┬────────┘
             │                                │
    ┌────────▼────────────────────────────────▼────────┐
    │              Renderer                             │
    │  - House with upgrade visuals                     │
    │  - Families with words                            │
    │  - UI (health, points, wave)                      │
    └───────────────────────────────────────────────────┘
```

### Component Responsibilities

**Game Loop**: Orchestrates update and render cycles at 60 FPS using delta time for frame-independent updates.

**Input System**: Captures keyboard events, maintains input queue, manages target selection, and validates typed characters against active family words.

**Game State**: Central state container holding health, fright points, wave number, active upgrades, and game phase (playing, game over, etc.).

**Entity Manager**: Manages family entities including spawning, movement toward house, damage dealing when at door, and removal when scared or defeated.

**Wave System**: Controls wave progression, spawn timing, family composition based on difficulty, and inter-wave transitions.

**Upgrade System**: Handles upgrade catalog, purchase validation, effect application, difficulty scaling, and visual representation management.

**Renderer**: Draws all visual elements including the house (with layered upgrade visuals), families with typing progress, and UI elements.

## Components and Interfaces

### Core Data Structures

```typescript
// Example structure (adapt to chosen language)

interface GameState {
  health: number;
  frightPoints: number;
  currentWave: number;
  gamePhase: 'menu' | 'playing' | 'game_over';
  purchasedUpgrades: UpgradeId[];
}

interface Family {
  id: string;
  size: FamilySize; // 'small' | 'medium' | 'large'
  word: string;
  typedIndex: number; // How many characters typed
  position: Vector2;
  velocity: number;
  pointValue: number;
  atDoor: boolean;
  damageTimer: number; // Accumulator for damage ticks
}

interface Upgrade {
  id: string;
  name: string;
  category: UpgradeCategory;
  cost: number;
  description: string;
  visualAsset: string; // Reference to visual element
  effect: UpgradeEffect;
}

interface UpgradeEffect {
  type: 'damage_reduction' | 'spawn_delay' | 'point_multiplier' | 'health_boost';
  value: number;
  difficultyIncrease: number; // Discrete difficulty bump
}

interface WaveConfig {
  waveNumber: number;
  familyCount: number;
  spawnInterval: number; // Seconds between spawns
  sizeDistribution: { small: number; medium: number; large: number };
}
```

### Input System Interface

```typescript
interface InputSystem {
  // Process keyboard input
  handleKeyPress(key: string): void;
  
  // Get current target family
  getCurrentTarget(): Family | null;
  
  // Validate character against target word
  validateInput(char: string, family: Family): boolean;
  
  // Switch to next available target
  selectNextTarget(families: Family[]): void;
}
```

### Entity Manager Interface

```typescript
interface EntityManager {
  // Spawn a new family
  spawnFamily(size: FamilySize, word: string): Family;
  
  // Update all families (movement, damage)
  updateFamilies(deltaTime: number, gameState: GameState): void;
  
  // Remove family and award points
  scareFamily(familyId: string, gameState: GameState): void;
  
  // Get all active families
  getActiveFamilies(): Family[];
}
```

### Wave System Interface

```typescript
interface WaveSystem {
  // Generate wave configuration based on difficulty
  generateWave(waveNumber: number, upgradeLevel: number): WaveConfig;
  
  // Check if wave is complete
  isWaveComplete(families: Family[]): boolean;
  
  // Transition to next wave
  advanceWave(gameState: GameState): void;
}
```

### Upgrade System Interface

```typescript
interface UpgradeSystem {
  // Get available upgrades
  getAvailableUpgrades(): Upgrade[];
  
  // Attempt purchase
  purchaseUpgrade(upgradeId: string, gameState: GameState): boolean;
  
  // Apply upgrade effects to game mechanics
  applyUpgradeEffects(gameState: GameState): ModifiedStats;
  
  // Get visual elements for purchased upgrades
  getUpgradeVisuals(purchasedUpgrades: UpgradeId[]): VisualElement[];
}
```

## Data Models

### Family Size Categories

- **Small**: 1-2 members, 3-5 letter words, 10 points, base speed
- **Medium**: 3-4 members, 6-8 letter words, 25 points, 0.8x speed
- **Large**: 5-6 members, 9-12 letter words, 50 points, 0.6x speed

### Upgrade Categories

1. **Spectral Barriers** (Damage Reduction)
   - Visual: Glowing purple runes on door/windows
   - Effect: Reduce damage rate from families at door
   - Difficulty: +10% spawn rate

2. **Haunting Echoes** (Spawn Delay)
   - Visual: Ghostly wisps around house perimeter
   - Effect: Increase time between family spawns
   - Difficulty: +15% family size distribution toward larger

3. **Terror Amplifier** (Point Multiplier)
   - Visual: Pulsing supernatural aura on roof
   - Effect: Increase fright points earned
   - Difficulty: +20% spawn rate

4. **Ectoplasmic Reinforcement** (Health Boost)
   - Visual: Ethereal foundation glow
   - Effect: Increase maximum health
   - Difficulty: +10% family movement speed

### Word Dictionary Structure

Words organized by length tiers:
- Tier 1 (3-5 chars): Common words for small families
- Tier 2 (6-8 chars): Moderate words for medium families
- Tier 3 (9-12 chars): Complex words for large families

Words should avoid ambiguous characters and prioritize typing flow.

## C
orrectness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: Family word display
*For any* spawned family, the game should display a word above that family unit
**Validates: Requirements 1.1**

Property 2: Correct character advances position
*For any* word and any correct next character, typing that character should advance the typing position by one
**Validates: Requirements 1.2**

Property 3: Incorrect character maintains position
*For any* word and any incorrect character, typing that character should not advance the typing position
**Validates: Requirements 1.3**

Property 4: Word completion removes family and awards points
*For any* family with a word, completing the word should remove the family from the game and increment fright points by the family's point value
**Validates: Requirements 1.4, 2.3**

Property 5: Damage rate equals family size
*For any* family at the door with incomplete word, the damage rate should equal one damage per second multiplied by the number of family members
**Validates: Requirements 1.5**

Property 6: Family size is valid
*For any* spawned family, the size category should be one of the defined family types (small, medium, large)
**Validates: Requirements 2.1**

Property 7: Larger families have longer words
*For any* two families where one is larger than the other, the larger family's word should have more characters
**Validates: Requirements 2.2, 2.4**

Property 8: Family visual variation
*For any* two families with different attributes, their rendered visual representations should differ in color or composition
**Validates: Requirements 2.5**

Property 9: Upgrade purchase deducts cost and applies effect
*For any* upgrade and game state with sufficient fright points, purchasing the upgrade should deduct the cost and apply the upgrade's effect
**Validates: Requirements 3.3**

Property 10: Insufficient funds prevents purchase
*For any* upgrade with cost greater than current fright points, attempting to purchase should fail and leave game state unchanged
**Validates: Requirements 3.4**

Property 11: Purchased upgrades persist
*For any* upgrade purchased during a game session, that upgrade should remain in the purchased upgrades list until game over
**Validates: Requirements 3.5**

Property 12: Upgrades increase difficulty discretely
*For any* upgrade purchase, the difficulty level for subsequent waves should increase by a discrete amount
**Validates: Requirements 4.1**

Property 13: Higher difficulty increases spawn challenge
*For any* two difficulty levels where one is higher, the higher difficulty should produce waves with higher spawn frequency or larger family sizes
**Validates: Requirements 4.2, 5.4**

Property 14: Wave composition factors upgrade level
*For any* two wave generations at different upgrade levels, the wave with higher upgrade level should have more challenging family distribution
**Validates: Requirements 4.4**

Property 15: Wave spawns match configuration
*For any* wave configuration, the spawned families should match the configuration's family count and size distribution
**Validates: Requirements 5.1**

Property 16: Wave completion triggers transition
*For any* wave where all families are defeated or have reached the house, the game should transition to the next wave
**Validates: Requirements 5.2**

Property 17: Wave transition displays information
*For any* wave transition, the game should display wave completion information and the upcoming wave number
**Validates: Requirements 5.3**

Property 18: UI displays correct game state
*For any* game state during gameplay, the UI should display the correct fright points, health, and wave number
**Validates: Requirements 6.1, 6.2, 6.3**

Property 19: Active families display correctly
*For any* set of active families, the game should display each family's position and associated word
**Validates: Requirements 6.4**

Property 20: Health changes update display immediately
*For any* health modification, the health display should reflect the new value
**Validates: Requirements 6.5**

Property 21: Input targets correct family
*For any* game state with multiple families, typed characters should apply to the currently targeted family
**Validates: Requirements 8.2**

Property 22: Word completion switches target
*For any* word completion when other families exist, the target should immediately switch to the next available family
**Validates: Requirements 8.3**

Property 23: Upgrade purchase updates house visuals
*For any* upgrade purchase, the house visual representation should update to include the upgrade's visual element
**Validates: Requirements 9.1, 9.5**

Property 24: All purchased upgrades render
*For any* set of purchased upgrades, all upgrade visual elements should be rendered on the house structure
**Validates: Requirements 9.2**

Property 25: Upgrade preview availability
*For any* upgrade in the catalog, the upgrade should have preview data showing its visual appearance
**Validates: Requirements 10.2**

## Error Handling

### Input Validation Errors

- **Invalid character input**: Provide visual feedback (shake, red flash) without advancing position
- **Empty word list**: Log error and use fallback word list to prevent game crash
- **Null target family**: Silently ignore input when no families are active

### State Management Errors

- **Negative health**: Clamp health to zero and trigger game over
- **Negative fright points**: Prevent transactions that would result in negative balance
- **Invalid upgrade ID**: Log error and prevent purchase attempt

### Rendering Errors

- **Missing visual asset**: Use placeholder visual and log warning
- **Overlapping upgrade visuals**: Layer visuals with z-index based on purchase order
- **Off-screen family**: Clamp family positions to visible game bounds

### Wave System Errors

- **Invalid wave configuration**: Use default configuration and log error
- **Spawn timing conflicts**: Queue spawns and process in order
- **Empty family pool**: End game gracefully with victory condition

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and edge cases:

- **Game initialization**: Verify default values (health=100, points=0, wave=1)
- **Empty family list**: Verify input handling doesn't crash
- **Health reaches zero**: Verify game over state transition
- **Upgrade menu display**: Verify all required information is shown
- **Game over state**: Verify restart option is available
- **Base house display**: Verify no upgrade visuals at game start
- **Upgrade categories**: Verify multiple distinct categories exist

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using a PBT library appropriate for the chosen language (e.g., fast-check for JavaScript/TypeScript, Hypothesis for Python, QuickCheck for Haskell/Rust).

Each property-based test should:
- Run a minimum of 100 iterations with randomly generated inputs
- Be tagged with a comment referencing the design document property
- Use the format: `**Feature: ghost-typing-defender, Property {number}: {property_text}**`

Test generators should:
- Generate valid family sizes (small, medium, large)
- Generate words of appropriate length for each size tier
- Generate valid game states with realistic value ranges
- Generate upgrade combinations that respect purchase constraints
- Generate wave configurations with valid spawn parameters

Property tests will cover:
- Typing mechanics (character validation, position advancement)
- Point economy (earning, spending, persistence)
- Damage calculation (rate based on family size)
- Wave progression (spawning, transitions, difficulty scaling)
- Upgrade system (purchase validation, effect application, visual updates)
- UI state synchronization (display reflects actual state)
- Target management (correct family receives input)

### Integration Testing

Integration tests will verify component interactions:
- Input system → Entity manager → Game state flow
- Wave system → Entity manager spawning coordination
- Upgrade system → Wave system difficulty scaling
- Renderer → Game state synchronization

### Performance Testing

- Verify 60 FPS maintenance with 10+ active families
- Verify input processing latency < 16ms (one frame)
- Verify no dropped keystrokes during rapid typing (10+ keys/second)

## Visual Design Implementation

### House Rendering System

The house is rendered as a base structure with layered upgrade visuals:

```
Base House Layer (z-index: 0)
  ↓
Upgrade Layer 1 (z-index: 1) - Foundation/structural upgrades
  ↓
Upgrade Layer 2 (z-index: 2) - Door/window upgrades
  ↓
Upgrade Layer 3 (z-index: 3) - Roof/aura upgrades
  ↓
Upgrade Layer 4 (z-index: 4) - Perimeter effects
```

### Upgrade Visual Specifications

**Spectral Barriers**:
- Position: Door and window frames
- Visual: Glowing purple runes (color: #5B1391)
- Animation: Subtle pulse (0.5s cycle)

**Haunting Echoes**:
- Position: House perimeter (circular pattern)
- Visual: Ghostly wisps (color: #A469D6 with transparency)
- Animation: Drift motion (2s cycle)

**Terror Amplifier**:
- Position: Roof peak
- Visual: Pulsing supernatural aura (color: #7A27B8)
- Animation: Expand/contract (1s cycle)

**Ectoplasmic Reinforcement**:
- Position: Foundation base
- Visual: Ethereal glow (color: #5B1391 with gradient)
- Animation: Gentle shimmer (1.5s cycle)

### Animation Transitions

When an upgrade is purchased:
1. Fade in upgrade visual over 0.3s
2. Play particle burst effect at upgrade location
3. Brief screen shake (2px amplitude, 0.2s duration)
4. Play audio cue (if audio system implemented)

## Performance Considerations

### Frame Budget (60 FPS = 16.67ms per frame)

- Input processing: < 1ms
- Entity updates: < 5ms
- Rendering: < 10ms
- Remaining: 0.67ms buffer

### Optimization Strategies

- **Object pooling**: Reuse family objects instead of creating/destroying
- **Spatial partitioning**: Only update families near the house
- **Render culling**: Skip rendering off-screen elements
- **Batch rendering**: Group similar visual elements
- **Delta time**: Use frame-independent updates for consistent behavior

### Memory Management

- Limit active families to reasonable maximum (e.g., 20)
- Preload all visual assets at game start
- Clear completed wave data after transition
- Avoid memory leaks in event listeners

## Future Extensibility

### Potential Enhancements

- **Power-ups**: Temporary abilities (slow time, auto-complete word)
- **Boss waves**: Special challenging families with unique mechanics
- **Combo system**: Bonus points for consecutive correct words
- **Difficulty modes**: Easy/Normal/Hard presets
- **Leaderboards**: Persistent high score tracking
- **Sound design**: Audio feedback for all game events
- **Particle effects**: Enhanced visual feedback system
- **Mobile support**: Touch-based typing interface

### Architecture Support

The component-based architecture supports extension through:
- New upgrade categories via UpgradeSystem interface
- New family types via EntityManager configuration
- New wave patterns via WaveSystem configuration
- New visual effects via Renderer plugin system
