import { GameLoop } from './core/GameLoop';
import { Renderer } from './rendering/Renderer';
import { HouseRenderer } from './rendering/HouseRenderer';
import { Colors } from './rendering/colors';
import { GameStateManager } from './core/GameState';
import { EntityManager } from './entities/EntityManager';
import { WordDictionary } from './data/words';
import { InputSystem } from './systems/InputSystem';
import { WaveSystem } from './systems/WaveSystem';
import { UpgradeSystem } from './systems/UpgradeSystem';
class Game {
    constructor() {
        this.time = 0;
        this.kiroImage = null;
        this.ghostTimeOffset = Math.random() * Math.PI * 2; // Random start position
        this.upgradeButtons = [];
        const canvas = document.getElementById('game-canvas');
        if (!canvas) {
            throw new Error('Canvas element not found');
        }
        this.renderer = new Renderer(canvas);
        this.houseRenderer = new HouseRenderer();
        this.gameState = new GameStateManager();
        // Door is at the house position
        const doorX = this.renderer.width / 2 - 20;
        this.entityManager = new EntityManager(doorX, this.renderer.width);
        this.wordDictionary = new WordDictionary();
        this.inputSystem = new InputSystem(this.entityManager, this.gameState);
        this.waveSystem = new WaveSystem();
        this.upgradeSystem = new UpgradeSystem();
        this.gameLoop = new GameLoop((deltaTime) => this.update(deltaTime), () => this.render());
        // Load Kiro logo
        this.kiroImage = new Image();
        this.kiroImage.src = '/kiro.webp';
        // Start game on any key press
        window.addEventListener('keydown', (e) => {
            const state = this.gameState.getState();
            if (state.gamePhase === 'menu') {
                this.gameState.startGame();
                // Start first wave
                const waveConfig = this.waveSystem.generateWave(1, 0);
                this.waveSystem.startWave(waveConfig);
            }
        });
        // Handle upgrade clicks
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.handleUpgradeClick(x, y);
        });
    }
    start() {
        console.log('🎮 Ghost Typing Defender starting...');
        this.gameLoop.start();
    }
    update(deltaTime) {
        this.time += deltaTime;
        const state = this.gameState.getState();
        if (state.gamePhase === 'playing') {
            // Update wave system
            const spawnEvent = this.waveSystem.update(deltaTime);
            // Spawn family if wave system says so
            if (spawnEvent) {
                const word = this.wordDictionary.getWordForSize(spawnEvent.size);
                const houseGroundY = this.renderer.height / 2 + 150;
                this.entityManager.spawnFamily(spawnEvent.size, word, houseGroundY, spawnEvent.fromRight);
            }
            // Update families
            this.entityManager.updateFamilies(deltaTime, this.gameState);
            // Check for wave completion
            const activeFamilies = this.entityManager.getActiveFamilies();
            if (this.waveSystem.isWaveComplete(activeFamilies.length)) {
                if (!this.waveSystem.inTransition()) {
                    // Start transition to next wave
                    this.waveSystem.startTransition();
                }
                else if (this.waveSystem.isTransitionComplete()) {
                    // Advance to next wave
                    this.gameState.advanceWave();
                    const upgradeLevel = state.purchasedUpgrades.length;
                    this.waveSystem.advanceWave(state.currentWave, upgradeLevel);
                }
            }
        }
    }
    render() {
        const state = this.gameState.getState();
        // Clear screen
        this.renderer.clear();
        if (state.gamePhase === 'menu') {
            this.renderMenu();
        }
        else if (state.gamePhase === 'playing') {
            this.renderGame();
        }
        else if (state.gamePhase === 'game_over') {
            this.renderGameOver();
        }
    }
    renderMenu() {
        // Draw title
        this.renderer.drawText('GHOST TYPING DEFENDER', this.renderer.width / 2, 50, Colors.PURPLE_300, 48, 'center');
        // Draw subtitle with pulsing effect
        const pulseAlpha = Math.sin(this.time * 2) * 0.3 + 0.7;
        const pulseColor = `rgba(164, 105, 214, ${pulseAlpha})`;
        this.renderer.drawText('Defend your haunted house...', this.renderer.width / 2, 120, pulseColor, 24, 'center');
        // Draw house
        this.drawHouse();
        // Draw floating ghost doing figure-8
        this.drawFloatingGhost();
        // Instructions
        this.renderer.drawText('Press any key to start typing...', this.renderer.width / 2, this.renderer.height - 50, Colors.FOG_300, 20, 'center');
    }
    renderGame() {
        const state = this.gameState.getState();
        // Draw UI at top
        this.renderer.drawText(`Health: ${state.health}`, 20, 20, Colors.FOG_100, 20);
        this.renderer.drawText(`Fright Points: ${state.frightPoints}`, 20, 50, Colors.PURPLE_300, 20);
        this.renderer.drawText(`Wave: ${state.currentWave}`, 20, 80, Colors.FOG_300, 20);
        // Draw upgrade shop at top right
        this.drawUpgradeShop();
        // Draw house
        this.drawHouse();
        // Draw floating ghost during gameplay too
        this.drawFloatingGhost();
        // Draw families
        this.drawFamilies();
        // Draw wave transition overlay
        if (this.waveSystem.inTransition()) {
            const timeRemaining = Math.ceil(this.waveSystem.getTransitionTimeRemaining());
            const progress = this.waveSystem.getTransitionProgress();
            // Semi-transparent overlay
            const ctx = this.renderer.getContext();
            ctx.fillStyle = 'rgba(10, 10, 13, 0.7)';
            ctx.fillRect(0, 0, this.renderer.width, this.renderer.height);
            // Wave complete message
            this.renderer.drawText(`Wave ${state.currentWave} Complete!`, this.renderer.width / 2, this.renderer.height / 2 - 40, Colors.PURPLE_300, 36, 'center');
            // Next wave countdown
            this.renderer.drawText(`Next wave in ${timeRemaining}...`, this.renderer.width / 2, this.renderer.height / 2 + 20, Colors.FOG_300, 24, 'center');
        }
    }
    drawFamilies() {
        const families = this.entityManager.getActiveFamilies();
        const currentTarget = this.inputSystem.getCurrentTarget();
        // Calculate word positions to prevent overlap
        const wordHeight = 30; // Height of one word line
        const wordPositions = new Map();
        // Sort families by X position (left to right)
        const sortedFamilies = [...families].sort((a, b) => a.position.x - b.position.x);
        for (let i = 0; i < sortedFamilies.length; i++) {
            const family = sortedFamilies[i];
            let wordY = family.position.y - 70;
            // Check for overlaps with previous families
            for (let j = 0; j < i; j++) {
                const otherFamily = sortedFamilies[j];
                const otherWordY = wordPositions.get(otherFamily.id) || 0;
                // If X positions are close (within 100px), stack vertically
                if (Math.abs(family.position.x - otherFamily.position.x) < 100) {
                    // Move this word above the other if they would overlap
                    if (Math.abs(wordY - otherWordY) < wordHeight) {
                        wordY = otherWordY - wordHeight;
                    }
                }
            }
            wordPositions.set(family.id, wordY);
        }
        for (const family of families) {
            const ctx = this.renderer.getContext();
            const isTarget = currentTarget?.id === family.id;
            const wordY = wordPositions.get(family.id) || family.position.y - 50;
            // Draw family members as stick figures
            const spacing = 20;
            const startX = family.position.x - (family.memberCount - 1) * spacing / 2;
            for (let i = 0; i < family.memberCount; i++) {
                const figureX = startX + i * spacing;
                this.drawStickFigure(figureX, family.position.y, family.color);
            }
            // Draw word with fade-out animation when scared
            if (family.scared) {
                // Whispy fade-out animation (0.2 seconds)
                const fadeProgress = Math.min(family.scaredTimer / 0.2, 1);
                if (fadeProgress < 1) {
                    const scale = 1 + fadeProgress * 1.5;
                    const alpha = 1 - fadeProgress;
                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.font = `${20 * scale}px monospace`;
                    ctx.fillStyle = Colors.PURPLE_300;
                    ctx.textAlign = 'center';
                    ctx.fillText(family.word, family.position.x, wordY);
                    ctx.restore();
                }
            }
            else {
                // Draw word at calculated position
                const typedPart = family.word.substring(0, family.typedIndex);
                const remainingPart = family.word.substring(family.typedIndex);
                // Calculate word width for target box
                ctx.font = '20px monospace';
                const wordWidth = ctx.measureText(family.word).width;
                // Draw target indicator around the word
                if (isTarget) {
                    ctx.strokeStyle = Colors.PURPLE_400;
                    ctx.lineWidth = 2;
                    ctx.setLineDash([5, 5]);
                    ctx.strokeRect(family.position.x - 35, wordY - 5, wordWidth + 10, 28);
                    ctx.setLineDash([]);
                }
                // Typed characters in green
                if (typedPart) {
                    this.renderer.drawText(typedPart, family.position.x - 30, wordY, '#4CAF50', 20);
                }
                // Remaining characters in white
                const typedWidth = ctx.measureText(typedPart).width;
                this.renderer.drawText(remainingPart, family.position.x - 30 + typedWidth, wordY, Colors.FOG_100, 20);
            }
            // Show "KNOCK!" animation if at door
            if (family.atDoor) {
                // Animate based on damage timer (shows briefly each second)
                const knockProgress = family.damageTimer;
                if (knockProgress < 0.3) {
                    // Comic book style animation
                    const scale = 1 + knockProgress * 2;
                    const alpha = 1 - knockProgress / 0.3;
                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.font = `bold ${24 * scale}px monospace`;
                    ctx.textAlign = 'center';
                    // Draw black outline
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 4;
                    ctx.strokeText('KNOCK!', family.position.x, wordY - 30);
                    // Draw purple fill
                    ctx.fillStyle = Colors.PURPLE_500;
                    ctx.fillText('KNOCK!', family.position.x, wordY - 30);
                    ctx.restore();
                }
            }
        }
    }
    drawStickFigure(x, y, color) {
        const ctx = this.renderer.getContext();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        // Head
        ctx.beginPath();
        ctx.arc(x, y - 25, 5, 0, Math.PI * 2);
        ctx.stroke();
        // Body
        ctx.beginPath();
        ctx.moveTo(x, y - 20);
        ctx.lineTo(x, y - 5);
        ctx.stroke();
        // Arms
        ctx.beginPath();
        ctx.moveTo(x - 6, y - 15);
        ctx.lineTo(x + 6, y - 15);
        ctx.stroke();
        // Legs
        ctx.beginPath();
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x - 5, y + 5);
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x + 5, y + 5);
        ctx.stroke();
    }
    renderGameOver() {
        this.renderer.drawText('GAME OVER', this.renderer.width / 2, this.renderer.height / 2 - 50, Colors.PURPLE_500, 48, 'center');
        this.renderer.drawText('Press R to restart', this.renderer.width / 2, this.renderer.height / 2 + 20, Colors.FOG_300, 24, 'center');
    }
    drawHouse() {
        const state = this.gameState.getState();
        const houseX = this.renderer.width / 2 - 100;
        const houseY = this.renderer.height / 2;
        const ctx = this.renderer.getContext();
        // Draw house with upgrade visuals
        this.houseRenderer.drawHouse(ctx, houseX, houseY, state.purchasedUpgrades, this.time);
    }
    drawFloatingGhost() {
        const ctx = this.renderer.getContext();
        const centerX = this.renderer.width / 2;
        const centerY = this.renderer.height / 2 - 50;
        // Figure-8 (lemniscate) parametric equations with random offset
        // Add subtle speed variance using sine wave (±5% speed variation)
        const baseSpeed = 0.8;
        const speedVariance = Math.sin(this.time * 0.3) * 0.04; // Slow oscillation
        const speed = baseSpeed + speedVariance;
        const t = this.time * speed + this.ghostTimeOffset;
        const amplitude = 150;
        const ghostX = centerX + amplitude * Math.cos(t);
        const ghostY = centerY + (amplitude / 2) * Math.sin(2 * t);
        // Add smooth vertical bounce
        const bounceSpeed = 2.5;
        const bounceAmount = 8;
        const bounce = Math.sin(this.time * bounceSpeed) * bounceAmount;
        const finalGhostY = ghostY + bounce;
        // Determine facing direction based on X position (flip at center)
        const facingRight = ghostX > centerX;
        if (this.kiroImage && this.kiroImage.complete) {
            // Use Kiro logo
            const size = 50;
            ctx.save();
            // Add glow effect
            ctx.shadowBlur = 20;
            ctx.shadowColor = Colors.PURPLE_500;
            // Flip horizontally if facing left
            if (!facingRight) {
                ctx.translate(ghostX, ghostY);
                ctx.scale(-1, 1);
                ctx.translate(-ghostX, -ghostY);
            }
            // Draw bright white body
            ctx.filter = 'grayscale(1) brightness(6) contrast(2)';
            ctx.drawImage(this.kiroImage, ghostX - size / 2, finalGhostY - size / 2, size, size);
            ctx.restore();
            // Draw black eyes on top (no filter) - elongated vertically
            const eyeWidth = 3;
            const eyeHeight = 5.4;
            const eyeSpacing = 8;
            ctx.fillStyle = '#000000';
            // Left eye
            ctx.beginPath();
            ctx.ellipse(ghostX - eyeSpacing / 2, finalGhostY - 2, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
            ctx.fill();
            // Right eye
            ctx.beginPath();
            ctx.ellipse(ghostX + eyeSpacing / 2, finalGhostY - 2, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        else {
            // Fallback: simple circle ghost
            ctx.shadowBlur = 20;
            ctx.shadowColor = Colors.PURPLE_500;
            this.renderer.drawCircle(ghostX, ghostY, 25, Colors.PURPLE_400);
            ctx.shadowBlur = 0;
            const eyeOffset = facingRight ? 8 : -8;
            this.renderer.drawCircle(ghostX + eyeOffset, ghostY - 5, 4, Colors.SHADOW_900);
            this.renderer.drawCircle(ghostX + eyeOffset, ghostY + 5, 4, Colors.SHADOW_900);
        }
    }
    drawUpgradeShop() {
        const state = this.gameState.getState();
        const availableUpgrades = this.upgradeSystem.getAvailableUpgrades(state.purchasedUpgrades);
        // Clear button array
        this.upgradeButtons = [];
        const startX = this.renderer.width - 220;
        const startY = 20;
        const buttonWidth = 200;
        const buttonHeight = 60;
        const spacing = 10;
        const ctx = this.renderer.getContext();
        for (let i = 0; i < availableUpgrades.length; i++) {
            const upgrade = availableUpgrades[i];
            const y = startY + i * (buttonHeight + spacing);
            const canAfford = state.frightPoints >= upgrade.cost;
            const bgColor = canAfford ? Colors.SHADOW_600 : Colors.SHADOW_800;
            const borderColor = canAfford ? Colors.PURPLE_400 : Colors.SHADOW_700;
            // Draw button background
            ctx.fillStyle = bgColor;
            ctx.fillRect(startX, y, buttonWidth, buttonHeight);
            // Draw border
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(startX, y, buttonWidth, buttonHeight);
            // Draw upgrade name
            const nameColor = canAfford ? Colors.PURPLE_300 : Colors.FOG_400;
            this.renderer.drawText(upgrade.name, startX + 10, y + 20, nameColor, 14);
            // Draw cost
            const costColor = canAfford ? Colors.FOG_100 : Colors.FOG_400;
            this.renderer.drawText(`Cost: ${upgrade.cost}`, startX + 10, y + 40, costColor, 12);
            // Store button bounds for click detection
            this.upgradeButtons.push({
                upgrade,
                x: startX,
                y,
                width: buttonWidth,
                height: buttonHeight,
            });
        }
    }
    handleUpgradeClick(x, y) {
        const state = this.gameState.getState();
        // Only allow purchases during gameplay
        if (state.gamePhase !== 'playing')
            return;
        for (const button of this.upgradeButtons) {
            if (x >= button.x &&
                x <= button.x + button.width &&
                y >= button.y &&
                y <= button.y + button.height) {
                // Check if can purchase
                if (this.upgradeSystem.canPurchase(button.upgrade.id, state.frightPoints, state.purchasedUpgrades)) {
                    // Deduct cost
                    this.gameState.spendFrightPoints(button.upgrade.cost);
                    // Add upgrade
                    this.gameState.addUpgrade(button.upgrade.id);
                    // Apply health boost immediately if applicable
                    if (button.upgrade.effect.type === 'health_boost') {
                        this.gameState.modifyHealth(button.upgrade.effect.value);
                    }
                    console.log(`Purchased: ${button.upgrade.name}`);
                }
                break;
            }
        }
    }
}
// Initialize and start the game
const game = new Game();
game.start();
