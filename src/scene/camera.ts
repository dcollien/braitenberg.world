import { Vehicle } from "./vehicle";

export class Camera {
  private _x = 0
  private _y = 0;

  x = 0;
  y = 0;
  follow = false;
  zoom = 1;

  update(dt: number, vehicle: Vehicle, dimensions: { width: number; height: number; }, globalPan: { x: number, y: number }, globalZoom: number) {
    const deadzone = Math.min(dimensions.width, dimensions.height) / 3;

    // place a target in front of the vehicle
    const targetX = vehicle.x + Math.cos(vehicle.rotation) * deadzone;
    const targetY = vehicle.y + Math.sin(vehicle.rotation) * deadzone;

    // camera follow if vehicle is moving out of view
    const dx = targetX - this._x;
    const dy = targetY - this._y;
    const targetDistance = Math.sqrt(dx * dx + dy * dy);

    // adjust camera speed based on distance from deadzone
    if (targetDistance > deadzone) {
      this.follow = true;
    } else if (targetDistance < 100) {
      this.follow = false;
    }

    // zoom based on vehicle speed
    const speed = (Math.abs(vehicle.leftSpeed) + Math.abs(vehicle.rightSpeed)) / 2;
    this.zoom = globalZoom * Math.min(1, Math.max(0.6, 1 - speed / 1000 + 0.1))

    const cameraSpeed = targetDistance / deadzone * 0.5;
    if (this.follow) {
      this._x += dx * cameraSpeed * dt;
      this._y += dy * cameraSpeed * dt;
    }

    this.x = this._x + globalPan.x;
    this.y = this._y + globalPan.y;

    return this.follow;
  }
}
