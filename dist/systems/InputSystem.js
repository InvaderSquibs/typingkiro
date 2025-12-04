export class InputSystem {
    constructor(entityManager, gameState) {
        this.entityManager = entityManager;
        this.gameState = gameState;
        this.currentTarget = null;
        this.setupKeyboardListeners();
    }
    setupKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            const state = this.gameState.getState();
            // Only process input during gameplay
            if (state.gamePhase !== 'playing')
                return;
            // Only process letter keys
            if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
                e.preventDefault();
                this.handleCharacterInput(e.key.toLowerCase());
            }
        });
    }
    handleCharacterInput(char) {
        const families = this.entityManager.getActiveFamilies();
        // If no families, ignore input
        if (families.length === 0) {
            this.currentTarget = null;
            return;
        }
        // If no current target, find one
        if (!this.currentTarget || !families.find(f => f.id === this.currentTarget?.id)) {
            this.selectNextTarget(families);
        }
        // Validate input against current target
        if (this.currentTarget) {
            const expectedChar = this.currentTarget.word[this.currentTarget.typedIndex];
            if (char === expectedChar) {
                // Correct character
                this.currentTarget.typedIndex++;
                // Check if word is complete
                if (this.currentTarget.typedIndex >= this.currentTarget.word.length) {
                    this.entityManager.scareFamily(this.currentTarget.id, this.gameState);
                    this.selectNextTarget(families);
                }
            }
            // Incorrect character - do nothing (no penalty)
        }
    }
    selectNextTarget(families) {
        if (families.length === 0) {
            this.currentTarget = null;
            return;
        }
        // Find the family closest to the door
        let closest = families[0];
        for (const family of families) {
            if (family.position.x > closest.position.x) {
                closest = family;
            }
        }
        this.currentTarget = closest;
    }
    getCurrentTarget() {
        return this.currentTarget;
    }
}
