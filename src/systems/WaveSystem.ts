import { FamilySize } from '../entities/Family';

export interface WaveConfig {
  waveNumber: number;
  familyCount: number;
  spawnInterval: number; // Seconds between spawns
  sizeDistribution: {
    small: number;
    medium: number;
    large: number;
  };
}

export type SpawnSide = 'left' | 'right';

export interface SpawnEvent {
  size: FamilySize;
  spawnTime: number; // Time in seconds when this family should spawn
  fromRight: boolean; // True if spawning from right side
}

export class WaveSystem {
  private currentWaveConfig: WaveConfig | null = null;
  private spawnQueue: SpawnEvent[] = [];
  private spawnTimer: number = 0;
  private waveStartTime: number = 0;
  private isWaveActive: boolean = false;
  private transitionDelay: number = 3.0; // 3 seconds between waves
  private transitionTimer: number = 0;
  private isInTransition: boolean = false;

  /**
   * Generate wave configuration based on wave number and difficulty (upgrade level)
   */
  generateWave(waveNumber: number, upgradeLevel: number): WaveConfig {
    // Base values that scale with wave number
    const baseCount = 3 + Math.floor(waveNumber / 2);
    const baseDifficulty = waveNumber + upgradeLevel;

    // Calculate family count (increases with waves and upgrades)
    const familyCount = Math.min(baseCount + Math.floor(upgradeLevel / 2), 20);

    // Calculate spawn interval (decreases with difficulty, minimum 1 second)
    const baseInterval = 3.0;
    const intervalReduction = Math.floor(baseDifficulty / 3) * 0.2;
    const spawnInterval = Math.max(1.0, baseInterval - intervalReduction);

    // Calculate size distribution based on difficulty
    // Early waves: mostly small families
    // Later waves: more medium and large families
    const difficultyFactor = Math.min(baseDifficulty / 10, 1.0);
    
    const smallPercent = Math.max(0.3, 0.7 - difficultyFactor * 0.4);
    const largePercent = Math.min(0.3, difficultyFactor * 0.3);
    const mediumPercent = 1.0 - smallPercent - largePercent;

    return {
      waveNumber,
      familyCount,
      spawnInterval,
      sizeDistribution: {
        small: smallPercent,
        medium: mediumPercent,
        large: largePercent,
      },
    };
  }

  /**
   * Start a new wave with the given configuration
   */
  startWave(config: WaveConfig): void {
    this.currentWaveConfig = config;
    this.spawnQueue = this.generateSpawnQueue(config);
    this.spawnTimer = 0;
    this.waveStartTime = 0;
    this.isWaveActive = true;
    this.isInTransition = false;
    this.transitionTimer = 0;
  }

  /**
   * Generate the spawn queue for a wave based on configuration
   */
  private generateSpawnQueue(config: WaveConfig): SpawnEvent[] {
    const queue: SpawnEvent[] = [];
    const { familyCount, spawnInterval, sizeDistribution } = config;

    for (let i = 0; i < familyCount; i++) {
      const size = this.selectFamilySize(sizeDistribution);
      const spawnTime = i * spawnInterval;
      const fromRight = Math.random() < 0.5; // 50% chance to spawn from right
      
      queue.push({ size, spawnTime, fromRight });
    }

    return queue;
  }

  /**
   * Select a family size based on distribution percentages
   */
  private selectFamilySize(distribution: { small: number; medium: number; large: number }): FamilySize {
    const roll = Math.random();
    
    if (roll < distribution.small) {
      return 'small';
    } else if (roll < distribution.small + distribution.medium) {
      return 'medium';
    } else {
      return 'large';
    }
  }

  /**
   * Update wave system timing
   * Returns the next family to spawn, or null if no spawn this frame
   */
  update(deltaTime: number): SpawnEvent | null {
    if (this.isInTransition) {
      this.transitionTimer += deltaTime;
      return null;
    }

    if (!this.isWaveActive || this.spawnQueue.length === 0) {
      return null;
    }

    this.spawnTimer += deltaTime;

    // Check if it's time to spawn the next family
    const nextSpawn = this.spawnQueue[0];
    if (this.spawnTimer >= nextSpawn.spawnTime) {
      // Remove from queue and return
      return this.spawnQueue.shift() || null;
    }

    return null;
  }

  /**
   * Check if the current wave is complete (all families spawned)
   */
  isSpawningComplete(): boolean {
    return this.spawnQueue.length === 0;
  }

  /**
   * Check if wave is active
   */
  isActive(): boolean {
    return this.isWaveActive;
  }

  /**
   * Start wave transition period
   */
  startTransition(): void {
    this.isWaveActive = false;
    this.isInTransition = true;
    this.transitionTimer = 0;
  }

  /**
   * Check if transition is complete
   */
  isTransitionComplete(): boolean {
    return this.isInTransition && this.transitionTimer >= this.transitionDelay;
  }

  /**
   * Get current wave config
   */
  getCurrentWaveConfig(): WaveConfig | null {
    return this.currentWaveConfig;
  }

  /**
   * Get transition progress (0 to 1)
   */
  getTransitionProgress(): number {
    if (!this.isInTransition) return 0;
    return Math.min(this.transitionTimer / this.transitionDelay, 1.0);
  }

  /**
   * Check if wave is complete (all families spawned AND all families defeated/at door)
   */
  isWaveComplete(activeFamilyCount: number): boolean {
    return this.isSpawningComplete() && activeFamilyCount === 0;
  }

  /**
   * Advance to next wave
   * This should be called after wave completion and transition
   */
  advanceWave(currentWaveNumber: number, upgradeLevel: number): WaveConfig {
    const nextWaveNumber = currentWaveNumber + 1;
    const nextWaveConfig = this.generateWave(nextWaveNumber, upgradeLevel);
    this.startWave(nextWaveConfig);
    return nextWaveConfig;
  }

  /**
   * Get remaining time in transition
   */
  getTransitionTimeRemaining(): number {
    if (!this.isInTransition) return 0;
    return Math.max(0, this.transitionDelay - this.transitionTimer);
  }

  /**
   * Check if currently in transition
   */
  inTransition(): boolean {
    return this.isInTransition;
  }

  /**
   * Reset wave system
   */
  reset(): void {
    this.currentWaveConfig = null;
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.waveStartTime = 0;
    this.isWaveActive = false;
    this.isInTransition = false;
    this.transitionTimer = 0;
  }
}
