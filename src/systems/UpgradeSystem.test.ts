import { describe, it, expect } from 'vitest';
import { UpgradeSystem } from './UpgradeSystem';

describe('UpgradeSystem', () => {
  const upgradeSystem = new UpgradeSystem();

  it('should return all available upgrades when none are purchased', () => {
    const available = upgradeSystem.getAvailableUpgrades([]);
    expect(available.length).toBe(4);
  });

  it('should filter out purchased upgrades', () => {
    const available = upgradeSystem.getAvailableUpgrades(['spectral_barriers_1']);
    expect(available.length).toBe(3);
    expect(available.find(u => u.id === 'spectral_barriers_1')).toBeUndefined();
  });

  it('should successfully purchase upgrade with sufficient funds', () => {
    const result = upgradeSystem.purchaseUpgrade('spectral_barriers_1', 100, []);
    expect(result.success).toBe(true);
    expect(result.remainingPoints).toBe(50);
    expect(result.upgrades).toContain('spectral_barriers_1');
  });

  it('should fail to purchase upgrade with insufficient funds', () => {
    const result = upgradeSystem.purchaseUpgrade('spectral_barriers_1', 25, []);
    expect(result.success).toBe(false);
    expect(result.remainingPoints).toBe(25);
    expect(result.upgrades.length).toBe(0);
  });

  it('should fail to purchase already owned upgrade', () => {
    const result = upgradeSystem.purchaseUpgrade('spectral_barriers_1', 100, ['spectral_barriers_1']);
    expect(result.success).toBe(false);
  });

  it('should apply upgrade effects correctly', () => {
    const stats = upgradeSystem.applyUpgradeEffects(['spectral_barriers_1', 'terror_amplifier_1']);
    expect(stats.damageReduction).toBe(0.25);
    expect(stats.pointMultiplier).toBe(1.5);
    expect(stats.difficultyIncrease).toBeCloseTo(0.3);
  });

  it('should cap damage reduction at 75%', () => {
    // Create multiple damage reduction upgrades
    const stats = upgradeSystem.applyUpgradeEffects([
      'spectral_barriers_1',
      'spectral_barriers_1', // Hypothetically if we could buy twice
    ]);
    expect(stats.damageReduction).toBeLessThanOrEqual(0.75);
  });
});
