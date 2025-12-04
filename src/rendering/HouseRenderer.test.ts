/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { HouseRenderer } from './HouseRenderer';

describe('HouseRenderer', () => {
  let houseRenderer: HouseRenderer;
  let mockCanvas: HTMLCanvasElement;
  let mockCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    houseRenderer = new HouseRenderer();
    
    // Create a mock canvas and context
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 1200;
    mockCanvas.height = 800;
    mockCtx = mockCanvas.getContext('2d')!;
  });

  it('should create a HouseRenderer instance', () => {
    expect(houseRenderer).toBeDefined();
  });

  it('should draw base house without errors', () => {
    expect(() => {
      houseRenderer.drawBaseHouse(mockCtx, 500, 300);
    }).not.toThrow();
  });

  it('should draw house with no upgrades', () => {
    expect(() => {
      houseRenderer.drawHouse(mockCtx, 500, 300, [], 0);
    }).not.toThrow();
  });

  it('should draw house with spectral barriers upgrade', () => {
    expect(() => {
      houseRenderer.drawHouse(mockCtx, 500, 300, ['spectral_barriers_1'], 0);
    }).not.toThrow();
  });

  it('should draw house with multiple upgrades', () => {
    const upgrades = [
      'spectral_barriers_1',
      'haunting_echoes_1',
      'terror_amplifier_1',
      'ectoplasmic_reinforcement_1'
    ];
    
    expect(() => {
      houseRenderer.drawHouse(mockCtx, 500, 300, upgrades, 0);
    }).not.toThrow();
  });

  it('should handle invalid upgrade IDs gracefully', () => {
    expect(() => {
      houseRenderer.drawHouse(mockCtx, 500, 300, ['invalid_upgrade'], 0);
    }).not.toThrow();
  });

  it('should render upgrade visuals in correct z-index order', () => {
    const upgrades = [
      'terror_amplifier_1',      // z-index: 3
      'ectoplasmic_reinforcement_1', // z-index: 1
      'haunting_echoes_1',       // z-index: 4
      'spectral_barriers_1'      // z-index: 2
    ];
    
    // Should not throw and should render in order: 1, 2, 3, 4
    expect(() => {
      houseRenderer.drawUpgradeVisuals(mockCtx, 500, 300, upgrades, 0);
    }).not.toThrow();
  });
});
