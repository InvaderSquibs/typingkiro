import { Family, FamilySize, createFamily, FAMILY_CONFIGS } from './Family';
import { GameStateManager } from '../core/GameState';

export class EntityManager {
  private families: Family[] = [];
  private nextId: number = 0;
  private doorX: number;
  private screenWidth: number;

  constructor(doorX: number, screenWidth: number = 800) {
    this.doorX = doorX;
    this.screenWidth = screenWidth;
  }

  spawnFamily(size: FamilySize, word: string, startY: number, fromRight: boolean = false): Family {
    const id = `family-${this.nextId++}`;
    const startX = fromRight ? this.screenWidth : 0; // Spawn from right or left edge
    const direction = fromRight ? 'right' : 'left';
    
    const family = createFamily(id, size, word, startX, startY, direction);
    this.families.push(family);
    
    return family;
  }

  updateFamilies(deltaTime: number, gameState: GameStateManager, damageReduction: number = 0): void {
    // Update families and remove scared ones that finished running
    this.families = this.families.filter(family => {
      if (family.scared) {
        // Run away in the direction they came from!
        family.scaredTimer += deltaTime;
        const scareDirection = family.direction === 'left' ? -1 : 1;
        family.position.x += scareDirection * family.velocity * 3 * deltaTime; // Run 3x faster
        
        // Remove after 1 second or off screen
        const offScreen = family.direction === 'left' 
          ? family.position.x < -100 
          : family.position.x > this.screenWidth + 100;
        return family.scaredTimer < 1.0 && !offScreen;
      }
      
      if (!family.atDoor) {
        // Move toward door based on spawn direction
        const moveDirection = family.direction === 'left' ? 1 : -1;
        family.position.x += moveDirection * family.velocity * deltaTime;
        
        // Check if reached door (with tolerance for both directions)
        const distanceToDoor = Math.abs(family.position.x - this.doorX);
        if (distanceToDoor < 5) {
          family.position.x = this.doorX;
          family.atDoor = true;
        }
      } else {
        // At door - deal damage
        family.damageTimer += deltaTime;
        
        // Deal 1 damage per second per family member (reduced by upgrades)
        if (family.damageTimer >= 1.0) {
          const baseDamage = family.memberCount;
          const reducedDamage = Math.ceil(baseDamage * (1 - damageReduction));
          gameState.modifyHealth(-reducedDamage);
          family.damageTimer = 0;
        }
      }
      
      return true; // Keep non-scared families
    });
  }

  scareFamily(familyId: string, gameState: GameStateManager, pointMultiplier: number = 1.0): boolean {
    const family = this.families.find(f => f.id === familyId);
    
    if (family) {
      const points = Math.floor(family.pointValue * pointMultiplier);
      gameState.addFrightPoints(points);
      family.scared = true;
      family.scaredTimer = 0;
      return true;
    }
    
    return false;
  }

  getActiveFamilies(): Family[] {
    return [...this.families];
  }

  clearAll(): void {
    this.families = [];
  }

  getFamilyById(id: string): Family | undefined {
    return this.families.find(f => f.id === id);
  }
}
