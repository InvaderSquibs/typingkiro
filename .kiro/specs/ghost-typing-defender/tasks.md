# Implementation Plan

- [X] 1. Set up project structure and core game loop
  - Create directory structure for game systems, entities, rendering, and assets
  - Implement 60 FPS game loop with delta time tracking
  - Set up basic rendering context (canvas/window)
  - _Requirements: 8.1_

- [x] 2. Implement core game state management
  - [x] 2.1 Create GameState data structure
    - Define GameState with health, frightPoints, currentWave, gamePhase, purchasedUpgrades
    - Implement state initialization with default values
    - _Requirements: 7.1_
  
  - [x] 2.2 Implement state update methods
    - Create methods for modifying health, points, wave number
    - Add state validation (clamp health to 0, prevent negative points)
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 3. Implement family entity system
  - [x] 3.1 Create Family data structure
    - Define Family with id, size, word, typedIndex, position, velocity, pointValue, atDoor, damageTimer
    - Implement family size categories (small, medium, large)
    - _Requirements: 2.1_
  
  - [x] 3.2 Implement EntityManager
    - Create spawnFamily method with size-based word assignment
    - Implement updateFamilies for movement and damage calculation
    - Add scareFamily method for removal and point awarding
    - _Requirements: 1.1, 1.4, 2.2, 2.3_
  
  - [x] 3.3 Write property test for family spawning
    - **Property 6: Family size is valid**
    - **Validates: Requirements 2.1**
  
  - [x] 3.4 Write property test for word length correlation
    - **Property 7: Larger families have longer words**
    - **Validates: Requirements 2.2, 2.4**
  
  - [x] 3.5 Write property test for damage rate
    - **Property 5: Damage rate equals family size**
    - **Validates: Requirements 1.5**

- [x] 4. Implement word dictionary and typing validation
  - [x] 4.1 Create word dictionary system
    - Build word lists organized by length tiers (3-5, 6-8, 9-12 chars)
    - Implement word selection based on family size
    - _Requirements: 2.2, 2.4_
  
  - [ ] 4.2 Implement typing validation logic
    - Create character matching function
    - Track typing position per family
    - Handle correct and incorrect input
    - _Requirements: 1.2, 1.3_
  
  - [ ]* 4.3 Write property test for correct character advancement
    - **Property 2: Correct character advances position**
    - **Validates: Requirements 1.2**
  
  - [ ]* 4.4 Write property test for incorrect character handling
    - **Property 3: Incorrect character maintains position**
    - **Validates: Requirements 1.3**

- [x] 5. Implement input system
  - [x] 5.1 Create InputSystem with keyboard event handling
    - Capture keyboard input with event listeners
    - Implement input queue for rapid typing
    - Add target family management
    - _Requirements: 8.1, 8.2, 8.5_
  
  - [x] 5.2 Implement target selection logic
    - Create getCurrentTarget method
    - Implement selectNextTarget for automatic switching
    - Handle empty family list gracefully
    - _Requirements: 8.2, 8.3, 8.4_
  
  - [ ]* 5.3 Write property test for input targeting
    - **Property 21: Input targets correct family**
    - **Validates: Requirements 8.2**
  
  - [ ]* 5.4 Write property test for target switching
    - **Property 22: Word completion switches target**
    - **Validates: Requirements 8.3**

- [x] 6. Implement wave system
  - [x] 6.1 Create WaveSystem with configuration generation
    - Define WaveConfig structure
    - Implement generateWave based on wave number and difficulty
    - Create spawn timing logic
    - _Requirements: 5.1, 5.4_
  
  - [x] 6.2 Implement wave progression logic
    - Add isWaveComplete check
    - Create advanceWave method with transition delay
    - Handle wave completion display
    - _Requirements: 5.2, 5.3_
  
  - [ ]* 6.3 Write property test for wave spawning
    - **Property 15: Wave spawns match configuration**
    - **Validates: Requirements 5.1**
  
  - [ ]* 6.4 Write property test for wave transitions
    - **Property 16: Wave completion triggers transition**
    - **Validates: Requirements 5.2**

- [Xa] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement upgrade system
  - [x] 8.1 Create Upgrade data structures
    - Define Upgrade with id, name, category, cost, description, visualAsset, effect
    - Define UpgradeEffect with type and values
    - Create upgrade catalog with 4 categories
    - _Requirements: 3.2, 10.1_
  
  - [x] 8.2 Implement UpgradeSystem
    - Create getAvailableUpgrades method
    - Implement purchaseUpgrade with validation
    - Add applyUpgradeEffects for difficulty scaling
    - _Requirements: 3.3, 3.4, 4.1_
  
  - [ ]* 8.3 Write property test for upgrade purchase
    - **Property 9: Upgrade purchase deducts cost and applies effect**
    - **Validates: Requirements 3.3**
  
  - [ ]* 8.4 Write property test for insufficient funds
    - **Property 10: Insufficient funds prevents purchase**
    - **Validates: Requirements 3.4**
  
  - [ ]* 8.5 Write property test for upgrade persistence
    - **Property 11: Purchased upgrades persist**
    - **Validates: Requirements 3.5**
  
  - [ ]* 8.6 Write property test for difficulty scaling
    - **Property 12: Upgrades increase difficulty discretely**
    - **Validates: Requirements 4.1**

- [-] 9. Implement base rendering system
  - [x] 9.1 Create Renderer with basic drawing
    - Set up rendering context and coordinate system
    - Implement clear and frame methods
    - Apply haunted house color palette
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [x] 9.2 Implement house rendering
    - Draw base house structure
    - Create upgrade visual layer system
    - _Requirements: 9.4_
  
  - [x] 9.3 Implement family rendering
    - Draw families with position and visual variation
    - Render words above families with typing progress
    - Add visual feedback for correct/incorrect input
    - _Requirements: 1.1, 1.2, 1.3, 2.5_
  
  - [x] 9.4 Implement UI rendering
    - Display health, fright points, wave number
    - Update upgrade menu display
    - _Requirements: 6.1, 6.2, 6.3, 3.2_

- [ ]* 9.5 Write property test for UI state display
    - **Property 18: UI displays correct game state**
    - **Validates: Requirements 6.1, 6.2, 6.3**

- [ ]* 9.6 Write property test for family display
    - **Property 19: Active families display correctly**
    - **Validates: Requirements 6.4**

- [ ] 10. Implement upgrade visual system
  - [ ] 10.1 Create upgrade visual assets
    - Design visual elements for each upgrade category
    - Implement visual layering system (z-index)
    - _Requirements: 9.2, 10.3_
  
  - [ ] 10.2 Implement upgrade visual rendering
    - Add getUpgradeVisuals method
    - Render all purchased upgrade visuals on house
    - Implement visual transition animations
    - _Requirements: 9.1, 9.2, 9.5_
  
  - [ ] 10.3 Create upgrade preview system
    - Add preview rendering in upgrade menu
    - Display visual and mechanical benefits
    - _Requirements: 10.2, 10.5_
  
  - [ ]* 10.4 Write property test for upgrade visual updates
    - **Property 23: Upgrade purchase updates house visuals**
    - **Validates: Requirements 9.1, 9.5**
  
  - [ ]* 10.5 Write property test for visual rendering
    - **Property 24: All purchased upgrades render**
    - **Validates: Requirements 9.2**

- [ ] 11. Implement game flow and state transitions
  - [ ] 11.1 Create game initialization
    - Implement new game setup
    - Start first wave spawning
    - _Requirements: 7.1, 7.2_
  
  - [ ] 11.2 Implement game over logic
    - Add health check and game over transition
    - Create game over screen with statistics
    - Implement restart functionality
    - _Requirements: 5.5, 7.3, 7.4, 7.5_
  
  - [ ] 11.3 Integrate all systems in game loop
    - Wire input → entity → state → render flow
    - Add wave progression integration
    - Connect upgrade system to difficulty scaling
    - _Requirements: All_

- [ ]* 11.4 Write property test for word completion
    - **Property 4: Word completion removes family and awards points**
    - **Validates: Requirements 1.4, 2.3**

- [ ] 12. Polish and visual feedback
  - [ ] 12.1 Add visual feedback animations
    - Implement character highlight on correct input
    - Add shake/flash on incorrect input
    - Create family removal animation
    - _Requirements: 1.2, 1.3_
  
  - [ ] 12.2 Implement upgrade purchase animations
    - Add particle burst effect
    - Create screen shake on purchase
    - Implement visual fade-in for new upgrades
    - _Requirements: 9.5_
  
  - [ ] 12.3 Add wave transition effects
    - Create wave completion display
    - Add transition delay with visual indicator
    - _Requirements: 5.3_

- [ ] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
