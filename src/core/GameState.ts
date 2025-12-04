export type GamePhase = 'menu' | 'playing' | 'game_over';

export interface GameState {
  health: number;
  frightPoints: number;
  currentWave: number;
  gamePhase: GamePhase;
  purchasedUpgrades: string[];
}

export class GameStateManager {
  private state: GameState;

  constructor() {
    this.state = this.getDefaultState();
  }

  private getDefaultState(): GameState {
    return {
      health: 100,
      frightPoints: 0,
      currentWave: 1,
      gamePhase: 'menu',
      purchasedUpgrades: [],
    };
  }

  getState(): GameState {
    return { ...this.state };
  }

  reset(): void {
    this.state = this.getDefaultState();
  }

  startGame(): void {
    this.state.gamePhase = 'playing';
  }

  modifyHealth(amount: number): void {
    this.state.health = Math.max(0, this.state.health + amount);
    
    if (this.state.health <= 0) {
      this.state.gamePhase = 'game_over';
    }
  }

  addFrightPoints(amount: number): void {
    this.state.frightPoints += amount;
  }

  spendFrightPoints(amount: number): boolean {
    if (this.state.frightPoints >= amount) {
      this.state.frightPoints -= amount;
      return true;
    }
    return false;
  }

  advanceWave(): void {
    this.state.currentWave++;
  }

  addUpgrade(upgradeId: string): void {
    if (!this.state.purchasedUpgrades.includes(upgradeId)) {
      this.state.purchasedUpgrades.push(upgradeId);
    }
  }

  hasUpgrade(upgradeId: string): boolean {
    return this.state.purchasedUpgrades.includes(upgradeId);
  }
}
