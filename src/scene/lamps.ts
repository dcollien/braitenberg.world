const DEFAULT_RADIUS = 250;
const CLICK_RADIUS = 50;

class Lamp {
  x: number;
  y: number;
  radius: number;
  intensity: number;

  constructor(x: number, y: number, radius: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.intensity = 1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

    // Create a radial gradient fill style
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);

    gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    gradient.addColorStop(0.05, 'rgba(255, 255, 250, 0.7)');
    gradient.addColorStop(0.08, 'rgba(255, 255, 240, 0.5)');
    gradient.addColorStop(0.15, 'rgba(255, 255, 240, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

    ctx.fillStyle = gradient;
    ctx.globalAlpha = this.intensity;
    ctx.fill();
    ctx.restore();
  }
}

export class Lamps {
  lamps: Lamp[];

  constructor() {
    this.lamps = [];
  }

  toggle(x: number, y: number) {
    const lamp = this.lamps.find(lamp => {
      const dx = lamp.x - x;
      const dy = lamp.y - y;
      return Math.sqrt(dx * dx + dy * dy) < CLICK_RADIUS;
    });

    if (lamp) {
      this.remove(x, y);
    } else {
      this.add(x, y);
    }
  }

  remove(x: number, y: number) {
    this.lamps = this.lamps.filter(lamp => {
      const dx = lamp.x - x;
      const dy = lamp.y - y;
      return Math.sqrt(dx * dx + dy * dy) > CLICK_RADIUS;
    });
  }

  add(x: number, y: number) {
    this.lamps.push(new Lamp(x, y, DEFAULT_RADIUS));
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.forEach(lamp => lamp.draw(ctx));
  }

  forEach(callback: (lamp: Lamp) => void) {
    this.lamps.forEach(callback);
  }
}
