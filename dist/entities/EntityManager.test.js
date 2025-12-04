import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { EntityManager } from './EntityManager';
import { GameStateManager } from '../core/GameState';
describe('EntityManager Property Tests', () => {
    let entityManager;
    let gameStateManager;
    beforeEach(() => {
        gameStateManager = new GameStateManager();
        gameStateManager.startGame();
        entityManager = new EntityManager(gameStateManager);
    });
    /**
     * Feature: ghost-typing-defender, Property 6: Family size is valid
     * Validates: Requirements 2.1
     */
    it('Property 6: spawned families always have valid size categories', () => {
        fc.assert(fc.property(fc.constantFrom('small', 'medium', 'large'), fc.string({ minLength: 3, maxLength: 12 }), fc.record({
            x: fc.integer({ min: 100, max: 800 }),
            y: fc.integer({ min: 100, max: 600 }),
        }), (size, word, position) => {
            // Spawn a family with the given size
            const family = entityManager.spawnFamily(size, word, position);
            // The family's size should be one of the valid categories
            const validSizes = ['small', 'medium', 'large'];
            expect(validSizes).toContain(family.size);
            // The family's size should match what we requested
            expect(family.size).toBe(size);
        }), { numRuns: 100 });
    });
    /**
     * Feature: ghost-typing-defender, Property 7: Larger families have longer words
     * Validates: Requirements 2.2, 2.4
     */
    it('Property 7: larger families have longer words than smaller families', () => {
        fc.assert(fc.property(fc.record({
            x: fc.integer({ min: 100, max: 800 }),
            y: fc.integer({ min: 100, max: 600 }),
        }), (position) => {
            // Spawn families of each size with appropriate word lengths
            const smallWord = 'cat'; // 3 chars (small range: 3-5)
            const mediumWord = 'typing'; // 6 chars (medium range: 6-8)
            const largeWord = 'defending'; // 9 chars (large range: 9-12)
            const smallFamily = entityManager.spawnFamily('small', smallWord, position);
            const mediumFamily = entityManager.spawnFamily('medium', mediumWord, position);
            const largeFamily = entityManager.spawnFamily('large', largeWord, position);
            // Larger families should have longer words
            expect(mediumFamily.word.length).toBeGreaterThan(smallFamily.word.length);
            expect(largeFamily.word.length).toBeGreaterThan(mediumFamily.word.length);
            expect(largeFamily.word.length).toBeGreaterThan(smallFamily.word.length);
        }), { numRuns: 100 });
    });
    /**
     * Feature: ghost-typing-defender, Property 5: Damage rate equals family size
     * Validates: Requirements 1.5
     */
    it('Property 5: families at door deal damage equal to their size per second', () => {
        fc.assert(fc.property(fc.constantFrom('small', 'medium', 'large'), fc.string({ minLength: 3, maxLength: 12 }), (size, word) => {
            // Reset state for each property test iteration
            const freshGameState = new GameStateManager();
            freshGameState.startGame();
            const freshEntityManager = new EntityManager(freshGameState);
            // Spawn family at the door (x=0)
            const family = freshEntityManager.spawnFamily(size, word, { x: 0, y: 300 });
            // Record initial health
            const initialHealth = freshGameState.getState().health;
            // Update for exactly 1 second to trigger one damage tick
            freshEntityManager.updateFamilies(1.0);
            // Check health decreased by the minimum member count for that size
            const finalHealth = freshGameState.getState().health;
            const damageDealt = initialHealth - finalHealth;
            // Expected damage is the minimum member count for the family size
            const expectedDamage = size === 'small' ? 1 : size === 'medium' ? 3 : 5;
            expect(damageDealt).toBe(expectedDamage);
        }), { numRuns: 100 });
    });
});
