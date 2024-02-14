import { Vehicle } from "./vehicle";

const BREADCRUMB_DROP_INTERVAL = 200;
const MIN_BREADCRUMB_DISTANCE = 1;

export class Breadcrumbs {
  breadcrumbs: { x: number; y: number, isStop: boolean }[] = [];
  lastBreadcrumbTime = 0;

  draw(ctx: CanvasRenderingContext2D) {
    let lastBreadcrumb = this.breadcrumbs[0];
    for (const { x, y, isStop } of this.breadcrumbs) {
      let radius = 2;
      if (isStop) radius = 4;
      
      ctx.fillStyle = "rgba(50, 150, 255, 0.5)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
  
      ctx.beginPath();
      if (lastBreadcrumb) {
        ctx.moveTo(lastBreadcrumb.x, lastBreadcrumb.y);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
  
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
  
      lastBreadcrumb = { x, y, isStop };
    }
  }

  update(_dt: number, vehicle: Vehicle) {
    const numBreadcrumbs = this.breadcrumbs.length;

    if (Date.now() - this.lastBreadcrumbTime > BREADCRUMB_DROP_INTERVAL) {
      this.lastBreadcrumbTime = Date.now();
      const lastBreadcrumb = this.breadcrumbs[this.breadcrumbs.length - 1];

      // only place a breadcrumb if the vehicle has moved a minimum distance
      if (lastBreadcrumb) {
        const dx = lastBreadcrumb.x - vehicle.x;
        const dy = lastBreadcrumb.y - vehicle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > MIN_BREADCRUMB_DISTANCE) {
          this.breadcrumbs.push({ x: vehicle.x, y: vehicle.y, isStop: false});
        } else if (!lastBreadcrumb.isStop) {
          this.breadcrumbs.push({ x: vehicle.x, y: vehicle.y, isStop: true});
        }
      } else {
        this.breadcrumbs.push({ x: vehicle.x, y: vehicle.y, isStop: false});
      }
    }

    return numBreadcrumbs !== this.breadcrumbs.length;
  }

  reset() {
    this.breadcrumbs = [];
    this.lastBreadcrumbTime = 0;
  }
}
