export class World {
  width: number;
  height: number;
  gridSize = 100;
  canvas: HTMLCanvasElement;
  fade = 1;

  constructor(width: number, height: number, canvas: HTMLCanvasElement) {
    this.width = width;
    this.height = height;
    this.canvas = canvas;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 1;

    const { x: x1g, y: y1g } = this.toGrid(-this.width/2, -this.height/2);
    const { x: x2g, y: y2g } = this.toGrid(this.width/2, this.height/2);
    const { x: x1, y: y1 } = this.fromGrid(x1g, y1g);
    const { x: x2, y: y2 } = this.fromGrid(x2g, y2g);

    for (let x = -this.width / 2; x < this.width / 2; x += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, y1);
      ctx.lineTo(x, y2);
      ctx.stroke();
    }
    for (let y = -this.height / 2; y < this.height / 2; y += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
    }

    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-this.width / 2, -this.height / 2);
    ctx.lineTo(this.width / 2, -this.height / 2);
    ctx.lineTo(this.width / 2, this.height / 2);
    ctx.lineTo(-this.width / 2, this.height / 2);
    ctx.lineTo(-this.width / 2, -this.height / 2);
    ctx.stroke();
    
    ctx.restore();
  }

  getBounds() {
    const canvas = this.canvas;
    return { x1: -canvas.width / 2 - this.width / 2, y1: -canvas.height / 2 - this.height / 2, x2: canvas.width / 2 + this.width / 2, y2: canvas.height / 2 + this.height / 2 };
  }

  toGrid(x: number, y: number) {
    return { x: Math.round(x / this.gridSize), y: Math.round(y / this.gridSize)};
  }

  fromGrid(x: number, y: number) {
    return { x: x * this.gridSize, y: y * this.gridSize };
  }
}