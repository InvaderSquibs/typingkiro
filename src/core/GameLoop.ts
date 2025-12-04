export class GameLoop {
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private targetFPS: number = 60;
  private isRunning: boolean = false;

  constructor(
    private updateCallback: (deltaTime: number) => void,
    private renderCallback: () => void
  ) {}

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private loop = (currentTime: number): void => {
    if (!this.isRunning) return;

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
