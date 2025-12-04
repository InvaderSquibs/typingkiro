# Requirements Document

## Introduction

Ghost Typing Defender is a tower defense typing game where the player assumes the role of a ghost defending their haunted house from families attempting to move in. Players must type words to scare away intruders, with word difficulty scaling based on family size. Successfully scaring families earns fright points that can be invested in house upgrades, which increase both defensive capabilities and game difficulty.

## Glossary

- **Ghost**: The player character who defends the haunted house
- **Family**: An enemy unit attempting to move into the house, represented by a typing challenge
- **Fright Points**: Currency earned by successfully scaring away families, used for upgrades
- **House Upgrade**: Defensive enhancement purchased with fright points that increases both power and difficulty
- **Typing Challenge**: A word that must be typed correctly to scare away a family
- **Wave**: A group of families that spawn together during gameplay
- **Game System**: The core game engine managing state, logic, and progression
- **Upgrade Category**: A classification of upgrades that share similar gameplay effects and visual themes

## Requirements

### Requirement 1

**User Story:** As a player, I want to type words to scare away families, so that I can defend my haunted house from intruders.

#### Acceptance Criteria

1. WHEN a family appears on screen, THEN the Game System SHALL display a word above the family unit
2. WHEN the player types a character that matches the next character in the active word, THEN the Game System SHALL highlight the typed character and advance the typing position
3. WHEN the player types an incorrect character, THEN the Game System SHALL provide visual feedback without advancing the typing position
4. WHEN the player completes typing a word correctly, THEN the Game System SHALL remove the corresponding family from the game and award fright points
5. WHEN a family reaches the house before their word is completed, THEN the Game System SHALL begin dealing continuous damage to the player's health at a rate of one damage per second per family member until the word is completed

### Requirement 2

**User Story:** As a player, I want families to vary in size and difficulty, so that the game remains challenging and engaging.

#### Acceptance Criteria

1. WHEN a family spawns, THEN the Game System SHALL assign a size category from the available family types
2. WHEN a larger family spawns, THEN the Game System SHALL assign a longer word with increased character count
3. WHEN a family is scared away, THEN the Game System SHALL award fright points proportional to the family size
4. WHEN generating words for families, THEN the Game System SHALL ensure word difficulty correlates with family size
5. WHEN displaying families, THEN the Game System SHALL render visual variations in color and composition based on family attributes

### Requirement 3

**User Story:** As a player, I want to earn and spend fright points on house upgrades, so that I can enhance my defensive capabilities.

#### Acceptance Criteria

1. WHEN the player scares away a family, THEN the Game System SHALL increment the fright points counter by the family's point value
2. WHEN the player accesses the upgrade menu, THEN the Game System SHALL display available upgrades with their costs and current fright point balance
3. WHEN the player purchases an upgrade with sufficient fright points, THEN the Game System SHALL deduct the cost and apply the upgrade effect
4. WHEN the player attempts to purchase an upgrade without sufficient fright points, THEN the Game System SHALL prevent the purchase and maintain the current state
5. WHEN an upgrade is purchased, THEN the Game System SHALL persist the upgrade state for the current game session

### Requirement 4

**User Story:** As a player, I want house upgrades to increase both my power and the game difficulty, so that progression feels meaningful and challenging.

#### Acceptance Criteria

1. WHEN the player purchases a house upgrade, THEN the Game System SHALL apply discrete difficulty increases to subsequent waves
2. WHEN difficulty increases through upgrades, THEN the Game System SHALL spawn families with higher frequency or larger sizes
3. WHEN an upgrade provides a defensive benefit, THEN the Game System SHALL apply the benefit to relevant game mechanics
4. WHEN calculating wave composition, THEN the Game System SHALL factor in the current upgrade level to determine enemy distribution

### Requirement 5

**User Story:** As a player, I want to progress through waves of families, so that I can experience escalating challenge and test my typing skills.

#### Acceptance Criteria

1. WHEN a wave begins, THEN the Game System SHALL spawn families according to the wave configuration
2. WHEN all families in a wave are defeated or reach the house, THEN the Game System SHALL transition to the next wave after a brief interval
3. WHEN transitioning between waves, THEN the Game System SHALL display wave completion information and upcoming wave number
4. WHEN wave difficulty increases, THEN the Game System SHALL adjust spawn rates and family composition accordingly
5. WHEN the player's health reaches zero, THEN the Game System SHALL end the game and display final statistics

### Requirement 6

**User Story:** As a player, I want to see my game state clearly, so that I can make informed decisions during gameplay.

#### Acceptance Criteria

1. WHEN the game is running, THEN the Game System SHALL display the current fright points balance
2. WHEN the game is running, THEN the Game System SHALL display the player's remaining health
3. WHEN the game is running, THEN the Game System SHALL display the current wave number
4. WHEN families are active, THEN the Game System SHALL display their positions and associated words
5. WHEN the player's health changes, THEN the Game System SHALL update the health display immediately

### Requirement 7

**User Story:** As a player, I want the game to have a clear start and end, so that I can understand when I'm playing and when the game concludes.

#### Acceptance Criteria

1. WHEN the player starts a new game, THEN the Game System SHALL initialize all game state with default values
2. WHEN the game begins, THEN the Game System SHALL start spawning the first wave of families
3. WHEN the player's health reaches zero, THEN the Game System SHALL transition to a game over state
4. WHEN the game ends, THEN the Game System SHALL display the final score, waves survived, and total families scared
5. WHEN in the game over state, THEN the Game System SHALL provide an option to restart with fresh game state

### Requirement 8

**User Story:** As a player, I want smooth and responsive controls, so that my typing accuracy directly translates to game performance.

#### Acceptance Criteria

1. WHEN the player presses a key, THEN the Game System SHALL process the input within one frame
2. WHEN multiple families are on screen, THEN the Game System SHALL apply typed characters to the currently targeted family
3. WHEN the player completes a word, THEN the Game System SHALL immediately switch focus to the next available family
4. WHEN no families are present, THEN the Game System SHALL ignore typing input without causing errors
5. WHEN the player types rapidly, THEN the Game System SHALL queue and process all inputs without dropping keystrokes

### Requirement 9

**User Story:** As a player, I want to see my house visually transform with each upgrade, so that I can delight in my progression and feel the impact of my investments.

#### Acceptance Criteria

1. WHEN the player purchases a house upgrade, THEN the Game System SHALL update the house visual representation to reflect the new upgrade
2. WHEN displaying the house, THEN the Game System SHALL render all purchased upgrades as distinct visual elements on the house structure
3. WHEN multiple upgrades are active, THEN the Game System SHALL combine their visual representations without visual conflicts
4. WHEN the game starts, THEN the Game System SHALL display the base house without any upgrade visuals
5. WHEN an upgrade is purchased, THEN the Game System SHALL animate the visual transition to the upgraded state

### Requirement 10

**User Story:** As a player, I want access to diverse upgrade types with unique visual representations, so that I can customize my strategy and enjoy varied progression paths.

#### Acceptance Criteria

1. WHEN browsing upgrades, THEN the Game System SHALL offer multiple distinct upgrade categories with different gameplay effects
2. WHEN an upgrade is displayed, THEN the Game System SHALL show a preview of its visual appearance on the house
3. WHEN upgrades provide different benefits, THEN the Game System SHALL ensure each upgrade type has a unique visual theme
4. WHEN the player has purchased upgrades from different categories, THEN the Game System SHALL display all visual elements cohesively on the house
5. WHEN displaying upgrade options, THEN the Game System SHALL communicate both the mechanical benefit and visual change clearly
