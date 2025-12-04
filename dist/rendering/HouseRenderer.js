import { Colors } from './colors';
export class HouseRenderer {
    constructor() {
        this.upgradeVisuals = new Map();
        this.initializeUpgradeVisuals();
    }
    initializeUpgradeVisuals() {
        // Spectral Barriers - Door and window runes (z-index: 2)
        this.upgradeVisuals.set('spectral_barriers', {
            category: 'spectral_barriers',
            zIndex: 2,
            render: (ctx, houseX, houseY, time) => {
                // Pulsing purple runes on door and windows
                const pulseAlpha = Math.sin(time * 2) * 0.3 + 0.7;
                ctx.globalAlpha = pulseAlpha;
                // Door runes (left and right of door)
                this.drawRune(ctx, houseX + 70, houseY + 110, 15);
                this.drawRune(ctx, houseX + 130, houseY + 110, 15);
                // Window runes (if we add windows later)
                this.drawRune(ctx, houseX + 30, houseY + 80, 12);
                this.drawRune(ctx, houseX + 170, houseY + 80, 12);
                ctx.globalAlpha = 1.0;
            }
        });
        // Ectoplasmic Reinforcement - Foundation glow (z-index: 1)
        this.upgradeVisuals.set('ectoplasmic_reinforcement', {
            category: 'ectoplasmic_reinforcement',
            zIndex: 1,
            render: (ctx, houseX, houseY, time) => {
                // Ethereal glow at foundation with shimmer
                const shimmer = Math.sin(time * 1.5) * 0.2 + 0.8;
                // Create gradient for glow effect
                const gradient = ctx.createLinearGradient(houseX, houseY + 130, houseX, houseY + 150);
                gradient.addColorStop(0, `rgba(91, 19, 145, ${0.6 * shimmer})`);
                gradient.addColorStop(1, `rgba(91, 19, 145, 0)`);
                ctx.fillStyle = gradient;
                ctx.fillRect(houseX - 10, houseY + 130, 220, 20);
            }
        });
        // Terror Amplifier - Roof aura (z-index: 3)
        this.upgradeVisuals.set('terror_amplifier', {
            category: 'terror_amplifier',
            zIndex: 3,
            render: (ctx, houseX, houseY, time) => {
                // Pulsing supernatural aura on roof peak
                const pulseSize = Math.sin(time * 1) * 10 + 20;
                ctx.save();
                ctx.shadowBlur = 30;
                ctx.shadowColor = Colors.PURPLE_500;
                // Draw aura at roof peak
                const roofPeakX = houseX + 100;
                const roofPeakY = houseY - 80;
                const gradient = ctx.createRadialGradient(roofPeakX, roofPeakY, 0, roofPeakX, roofPeakY, pulseSize);
                gradient.addColorStop(0, 'rgba(122, 39, 184, 0.8)');
                gradient.addColorStop(1, 'rgba(122, 39, 184, 0)');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(roofPeakX, roofPeakY, pulseSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });
        // Haunting Echoes - Perimeter wisps (z-index: 4)
        this.upgradeVisuals.set('haunting_echoes', {
            category: 'haunting_echoes',
            zIndex: 4,
            render: (ctx, houseX, houseY, time) => {
                // Ghostly wisps drifting around house perimeter
                const numWisps = 6;
                const radius = 140;
                for (let i = 0; i < numWisps; i++) {
                    const angle = (time * 0.5 + i * (Math.PI * 2 / numWisps)) % (Math.PI * 2);
                    const wispX = houseX + 100 + Math.cos(angle) * radius;
                    const wispY = houseY + 75 + Math.sin(angle) * (radius * 0.6);
                    // Draw wisp with transparency
                    ctx.save();
                    ctx.globalAlpha = 0.4 + Math.sin(time * 2 + i) * 0.2;
                    const gradient = ctx.createRadialGradient(wispX, wispY, 0, wispX, wispY, 15);
                    gradient.addColorStop(0, 'rgba(164, 105, 214, 0.8)');
                    gradient.addColorStop(1, 'rgba(164, 105, 214, 0)');
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(wispX, wispY, 15, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
        });
    }
    drawRune(ctx, x, y, size) {
        // Draw a mystical rune symbol
        ctx.strokeStyle = Colors.PURPLE_500;
        ctx.lineWidth = 2;
        // Simple rune: circle with cross
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.stroke();
        // Cross inside
        ctx.beginPath();
        ctx.moveTo(x - size * 0.6, y);
        ctx.lineTo(x + size * 0.6, y);
        ctx.moveTo(x, y - size * 0.6);
        ctx.lineTo(x, y + size * 0.6);
        ctx.stroke();
    }
    /**
     * Draw the base house structure
     */
    drawBaseHouse(ctx, houseX, houseY) {
        // House body
        ctx.fillStyle = Colors.SHADOW_700;
        ctx.fillRect(houseX, houseY, 200, 150);
        // Roof
        ctx.fillStyle = Colors.SHADOW_800;
        ctx.beginPath();
        ctx.moveTo(houseX - 20, houseY);
        ctx.lineTo(houseX + 100, houseY - 80);
        ctx.lineTo(houseX + 220, houseY);
        ctx.closePath();
        ctx.fill();
        // Windows
        ctx.fillStyle = Colors.SHADOW_900;
        ctx.fillRect(houseX + 20, houseY + 60, 40, 40);
        ctx.fillRect(houseX + 140, houseY + 60, 40, 40);
        // Door with purple glow
        ctx.fillStyle = Colors.SHADOW_900;
        ctx.fillRect(houseX + 75, houseY + 70, 50, 80);
        ctx.fillStyle = Colors.PURPLE_500;
        ctx.fillRect(houseX + 77, houseY + 72, 46, 76);
    }
    /**
     * Draw upgrade visuals layered on top of the house
     */
    drawUpgradeVisuals(ctx, houseX, houseY, purchasedUpgrades, time) {
        // Extract upgrade categories from purchased upgrade IDs
        const categories = new Set();
        for (const upgradeId of purchasedUpgrades) {
            // Extract category from upgrade ID (e.g., "spectral_barriers_1" -> "spectral_barriers")
            const parts = upgradeId.split('_');
            if (parts.length >= 2) {
                // Reconstruct category (handle multi-word categories)
                const category = parts.slice(0, -1).join('_');
                categories.add(category);
            }
        }
        // Sort visuals by z-index
        const visualsToRender = Array.from(categories)
            .map(cat => this.upgradeVisuals.get(cat))
            .filter((v) => v !== undefined)
            .sort((a, b) => a.zIndex - b.zIndex);
        // Render each visual layer
        for (const visual of visualsToRender) {
            ctx.save();
            visual.render(ctx, houseX, houseY, time);
            ctx.restore();
        }
    }
    /**
     * Draw the complete house with all upgrade visuals
     */
    drawHouse(ctx, houseX, houseY, purchasedUpgrades, time) {
        // Layer 0: Base house
        this.drawBaseHouse(ctx, houseX, houseY);
        // Layers 1-4: Upgrade visuals (sorted by z-index)
        this.drawUpgradeVisuals(ctx, houseX, houseY, purchasedUpgrades, time);
    }
}
