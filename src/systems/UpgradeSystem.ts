export type UpgradeCategory = 'spectral_barriers' | 'haunting_echoes' | 'terror_amplifier' | 'ectoplasmic_reinforcement';

export interface UpgradeEffect {
  type: 'damage_reduction' | 'spawn_delay' | 'point_multiplier' | 'health_boost';
  value: number;
  difficultyIncrease: number;
}

export interface Upgrade {
  id: string;
  name: string;
  category: UpgradeCategory;
  cost: number;
  description: string;
  visualAsset: string;
  effect: UpgradeEffect;
}

// Catalog of available upgrades
const UPGRADE_CATALOG: Upgrade[] = [
  {
    id: 'spectral_barriers_1',
    name: 'Spectral Barriers',
    category: 'spectral_barriers',
    cost: 50,
    description: 'Reduce damage by 25%',
    visualAsset: 'spectral_runes',
    effect: {
      type: 'damage_reduction',
      value: 0.25,
      difficultyIncrease: 0.1,
    },
  },
  {
    id: 'haunting_echoes_1',
    name: 'Haunting Echoes',
    category: 'haunting_echoes',
    cost: 75,
    description: 'Slow spawn rate by 20%',
    visualAsset: 'ghostly_wisps',
    effect: {
      type: 'spawn_delay',
      value: 0.2,
      difficultyIncrease: 0.15,
    },
  },
  {
    id: 'terror_amplifier_1',
    name: 'Terror Amplifier',
    category: 'terror_amplifier',
    cost: 100,
    description: '+50% fright points',
    visualAsset: 'supernatural_aura',
    effect: {
      type: 'point_multiplier',
      value: 0.5,
      difficultyIncrease: 0.2,
    },
  },
  {
    id: 'ectoplasmic_reinforcement_1',
    name: 'Ectoplasmic Reinforcement',
    category: 'ectoplasmic_reinforcement',
    cost: 60,
    description: '+25 max health',
    visualAsset: 'ethereal_glow',
    effect: {
      type: 'health_boost',
      value: 25,
      difficultyIncrease: 0.1,
    },
  },
];

export interface ModifiedStats {
  damageReduction: number;
  spawnDelay: number;
  pointMultiplier: number;
  healthBoost: number;
  difficultyIncrease: number;
}

export class UpgradeSystem {
  getAvailableUpgrades(purchasedUpgrades: string[]): Upgrade[] {
    // Return upgrades that haven't been purchased yet
    return UPGRADE_CATALOG.filter(upgrade => !purchasedUpgrades.includes(upgrade.id));
  }

  getUpgradeById(id: string): Upgrade | undefined {
    return UPGRADE_CATALOG.find(upgrade => upgrade.id === id);
  }

  canPurchase(upgradeId: string, frightPoints: number, purchasedUpgrades: string[]): boolean {
    const upgrade = this.getUpgradeById(upgradeId);
    if (!upgrade) return false;
    
    // Check if already purchased
    if (purchasedUpgrades.includes(upgradeId)) return false;
    
    // Check if enough points
    return frightPoints >= upgrade.cost;
  }

  purchaseUpgrade(upgradeId: string, frightPoints: number, purchasedUpgrades: string[]): { success: boolean; remainingPoints: number; upgrades: string[] } {
    const upgrade = this.getUpgradeById(upgradeId);
    
    // Validate upgrade exists
    if (!upgrade) {
      return { success: false, remainingPoints: frightPoints, upgrades: purchasedUpgrades };
    }
    
    // Validate not already purchased
    if (purchasedUpgrades.includes(upgradeId)) {
      return { success: false, remainingPoints: frightPoints, upgrades: purchasedUpgrades };
    }
    
    // Validate sufficient funds
    if (frightPoints < upgrade.cost) {
      return { success: false, remainingPoints: frightPoints, upgrades: purchasedUpgrades };
    }
    
    // Purchase successful - deduct cost and add upgrade
    return {
      success: true,
      remainingPoints: frightPoints - upgrade.cost,
      upgrades: [...purchasedUpgrades, upgradeId]
    };
  }

  applyUpgradeEffects(purchasedUpgrades: string[]): ModifiedStats {
    const stats: ModifiedStats = {
      damageReduction: 0,
      spawnDelay: 0,
      pointMultiplier: 1.0,
      healthBoost: 0,
      difficultyIncrease: 0,
    };

    for (const upgradeId of purchasedUpgrades) {
      const upgrade = this.getUpgradeById(upgradeId);
      if (!upgrade) continue;

      // Apply effect based on type
      switch (upgrade.effect.type) {
        case 'damage_reduction':
          stats.damageReduction += upgrade.effect.value;
          break;
        case 'spawn_delay':
          stats.spawnDelay += upgrade.effect.value;
          break;
        case 'point_multiplier':
          stats.pointMultiplier += upgrade.effect.value;
          break;
        case 'health_boost':
          stats.healthBoost += upgrade.effect.value;
          break;
      }

      // Accumulate difficulty increase
      stats.difficultyIncrease += upgrade.effect.difficultyIncrease;
    }

    // Cap damage reduction at 75%
    stats.damageReduction = Math.min(stats.damageReduction, 0.75);

    return stats;
  }

  getTotalDifficultyIncrease(purchasedUpgrades: string[]): number {
    let total = 0;
    for (const upgradeId of purchasedUpgrades) {
      const upgrade = this.getUpgradeById(upgradeId);
      if (upgrade) {
        total += upgrade.effect.difficultyIncrease;
      }
    }
    return total;
  }

  getDamageReduction(purchasedUpgrades: string[]): number {
    let reduction = 0;
    for (const upgradeId of purchasedUpgrades) {
      const upgrade = this.getUpgradeById(upgradeId);
      if (upgrade && upgrade.effect.type === 'damage_reduction') {
        reduction += upgrade.effect.value;
      }
    }
    return Math.min(reduction, 0.75); // Cap at 75% reduction
  }

  getPointMultiplier(purchasedUpgrades: string[]): number {
    let multiplier = 1.0;
    for (const upgradeId of purchasedUpgrades) {
      const upgrade = this.getUpgradeById(upgradeId);
      if (upgrade && upgrade.effect.type === 'point_multiplier') {
        multiplier += upgrade.effect.value;
      }
    }
    return multiplier;
  }
}
