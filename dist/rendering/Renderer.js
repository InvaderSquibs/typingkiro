import { Colors } from './colors';
export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get 2D context');
        }
        this.ctx = ctx;
        // Set canvas size
        this.width = 1200;
        this.height = 800;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }
    clear() {
        this.ctx.fillStyle = Colors.SHADOW_900;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }
    drawText(text, x, y, color = Colors.FOG_100, fontSize = 20, align = 'left') {
        this.ctx.fillStyle = color;
        this.ctx.font = `${fontSize}px monospace`;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(text, x, y);
    }
    drawCircle(x, y, radius, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    getContext() {
        return this.ctx;
    }
}
