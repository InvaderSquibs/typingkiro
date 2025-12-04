export class GameStateManager {
    constructor() {
        this.state = this.getDefaultState();
    }
    getDefaultState() {
        return {
            health: 100,
            frightPoints: 0,
            currentWave: 1,
            gamePhase: 'menu',
            purchasedUpgrades: [],
        };
    }
    getState() {
        return { ...this.state };
    }
    reset() {
        this.state = this.getDefaultState();
    }
    startGame() {
        this.state.gamePhase = 'playing';
    }
    modifyHealth(amount) {
        this.state.health = Math.max(0, this.state.health + amount);
        if (this.state.health <= 0) {
            this.state.gamePhase = 'game_over';
        }
    }
    addFrightPoints(amount) {
        this.state.frightPoints += amount;
    }
    spendFrightPoints(amount) {
        if (this.state.frightPoints >= amount) {
            this.state.frightPoints -= amount;
            return true;
        }
        return false;
    }
    advanceWave() {
        this.state.currentWave++;
    }
    addUpgrade(upgradeId) {
        if (!this.state.purchasedUpgrades.includes(upgradeId)) {
            this.state.purchasedUpgrades.push(upgradeId);
        }
    }
    hasUpgrade(upgradeId) {
        return this.state.purchasedUpgrades.includes(upgradeId);
    }
}
