import AnimationLoop from "./animationLoop";
import { Breadcrumbs } from "./scene/breadcrumbs";
import "./style.css";

import { World } from "./scene/world";
import { Vehicle } from "./scene/vehicle";
import { Camera } from "./scene/camera";
import { Agent } from "./agents/agent";
import { Lamps } from "./scene/lamps";

const BACKGROUND_COLOR = "#222222";

export class Simulation extends AnimationLoop {
  dimensions = { width: 800, height: 600 };
  repaint: boolean = true;

  world: World;
  vehicle: Vehicle = new Vehicle();
  camera: Camera = new Camera();
  breadcrumbs: Breadcrumbs = new Breadcrumbs();
  lamps: Lamps = new Lamps();

  agent: Agent;

  constructor(canvas: HTMLCanvasElement, agent: Agent) {
    super(canvas);
    this.agent = agent;
    this.world = new World(10000, 10000, canvas);
  }

  update(dt: number) {
    this.vehicle.updateSensors(this.lamps);

    const updates = [
      this.repaint,
      this.agent.update(dt, this.vehicle, this.lamps.lamps),
      this.vehicle.update(dt, this.world, this.breadcrumbs),
      this.breadcrumbs.update(dt, this.vehicle),
      this.camera.update(dt, this.vehicle, this.dimensions),
    ];

    this.repaint = false;

    return updates.some(Boolean);
  }

  draw(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = this.world.fade;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-this.camera.x, -this.camera.y);

    this.world.draw(ctx);

    this.breadcrumbs.draw(ctx);

    this.lamps.draw(ctx);

    this.vehicle.draw(ctx);

    this.agent.draw(ctx, this.vehicle);

    ctx.restore();
  }
}
