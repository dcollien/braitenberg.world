import { Vehicle } from "./vehicle";

export class Camera {
  x = 0;
  y = 0;
  follow = false;
  zoom = 1;

  update(dt: number, vehicle: Vehicle, dimensions: { width: number; height: number; }) {
    const deadzone = Math.min(dimensions.width, dimensions.height) / 3;
    
    // place a target in front of the vehicle
    const targetX = vehicle.x + Math.cos(vehicle.rotation) * deadzone;
    const targetY = vehicle.y + Math.sin(vehicle.rotation) * deadzone;


    // camera follow if vehicle is moving out of view
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const targetDistance = Math.sqrt(dx * dx + dy * dy);

    // adjust camera speed based on distance from deadzone
    if (targetDistance > deadzone) {
      this.follow = true;
    } else if (targetDistance < 100) {
      this.follow = false;
    }

    // zoom based on vehicle speed
    const speed = (Math.abs(vehicle.leftSpeed) + Math.abs(vehicle.rightSpeed)) / 2;
    this.zoom = Math.min(1, Math.max(0.6, 1 - speed / 1000 + 0.1));

    const cameraSpeed = targetDistance / deadzone * 0.5;
    if (this.follow) {
      this.x += dx * cameraSpeed * dt;
      this.y += dy * cameraSpeed * dt;

      return true;
    }

    return false;
  }
}
