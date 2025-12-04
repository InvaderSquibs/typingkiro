export class GameLoop {
    constructor(updateCallback, renderCallback) {
        this.updateCallback = updateCallback;
        this.renderCallback = renderCallback;
        this.lastTime = 0;
        this.animationFrameId = null;
        this.targetFPS = 60;
        this.isRunning = false;
        this.loop = (currentTime) => {
            if (!this.isRunning)
                return;
            // Calculate delta time in seconds
            const deltaTime = (currentTime - this.lastTime) / 1000;
            this.lastTime = currentTime;
            // Cap delta time to prevent spiral of death
            const cappedDelta = Math.min(deltaTime, 1 / 30);
            // Update game logic
            this.updateCallback(cappedDelta);
            // Render frame
            this.renderCallback();
            // Schedule next frame
            this.animationFrameId = requestAnimationFrame(this.loop);
        };
    }
    start() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.loop(this.lastTime);
    }
    stop() {
        this.isRunning = false;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
}
