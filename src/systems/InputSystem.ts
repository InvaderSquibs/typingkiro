import { Family } from '../entities/Family';
import { EntityManager } from '../entities/EntityManager';
import { GameStateManager } from '../core/GameState';

export class InputSystem {
  private currentTarget: Family | null = null;

  constructor(
    private entityManager: EntityManager,
    private gameState: GameStateManager
  ) {
    this.setupKeyboardListeners();
  }

  private setupKeyboardListeners(): void {
    window.addEventListener('keydown', (e) => {
      const state = this.gameState.getState();
      
      // Only process input during gameplay
      if (state.gamePhase !== 'playing') return;
      
      // Only process letter keys
      if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
        e.preventDefault();
        this.handleCharacterInput(e.key.toLowerCase());
      }
    });
  }

  private handleCharacterInput(char: string): void {
    const families = this.entityManager.getActiveFamilies();
    
    // If no families, ignore input
    if (families.length === 0) {
      this.currentTarget = null;
      return;
    }

    // If current target no longer exists, clear it
    if (this.currentTarget && !families.find(f => f.id === this.currentTarget?.id)) {
      this.currentTarget = null;
    }

    // If no current target, try to find a family that starts with this character
    if (!this.currentTarget) {
      const matchingFamily = families.find(f => 
        f.typedIndex === 0 && f.word[0] === char
      );
      
      if (matchingFamily) {
        // Lock onto this family
        this.currentTarget = matchingFamily;
        this.currentTarget.typedIndex++;
        
        // Check if it's a one-letter word (unlikely but possible)
        if (this.currentTarget.typedIndex >= this.currentTarget.word.length) {
          this.entityManager.scareFamily(this.currentTarget.id, this.gameState);
          this.currentTarget = null;
        }
      }
      // If no match, ignore the input (user typed wrong first letter)
      return;
    }

    // We have a target - validate input against it
    const expectedChar = this.currentTarget.word[this.currentTarget.typedIndex];
    
    if (char === expectedChar) {
      // Correct character
      this.currentTarget.typedIndex++;
      
      // Check if word is complete
      if (this.currentTarget.typedIndex >= this.currentTarget.word.length) {
        this.entityManager.scareFamily(this.currentTarget.id, this.gameState);
        this.currentTarget = null; // Clear target so user can choose next one
      }
    }
    // Incorrect character - do nothing (no penalty)
  }

  private selectNextTarget(families: Family[]): void {
    if (families.length === 0) {
      this.currentTarget = null;
      return;
    }

    // Find the family closest to the door (highest X position)
    let closest = families[0];
    for (const family of families) {
      if (family.position.x > closest.position.x) {
        closest = family;
      }
    }

    this.currentTarget = closest;
  }

  // Public method to manually select target (for future use)
  selectTarget(familyId: string): void {
    const families = this.entityManager.getActiveFamilies();
    const family = families.find(f => f.id === familyId);
    if (family) {
      this.currentTarget = family;
    }
  }

  getCurrentTarget(): Family | null {
    return this.currentTarget;
  }
}
