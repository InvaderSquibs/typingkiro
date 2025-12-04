import { Colors } from './colors';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  public width: number;
  public height: number;

  constructor(private canvas: HTMLCanvasElement) {
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

  clear(): void {
    this.ctx.fillStyle = Colors.SHADOW_900;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawRect(x: number, y: number, width: number, height: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  drawText(
    text: string,
    x: number,
    y: number,
    color: string = Colors.FOG_100,
    fontSize: number = 20,
    align: CanvasTextAlign = 'left'
  ): void {
    this.ctx.fillStyle = color;
    this.ctx.font = `${fontSize}px monospace`;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(text, x, y);
  }

  drawCircle(x: number, y: number, radius: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
}
