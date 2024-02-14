import { Vehicle } from "../scene/vehicle";
import { Agent } from "./agent";

const MAX_SPEED = 200;
const SLOWEST = 0.001;

export class DriverAgent extends Agent {
  actions: { [key: string]: boolean };

  constructor() {
    super();
    this.actions = {
      forward: false,
      reverse: false,
      left: false,
      right: false,
    };
  }

  update(dt: number, vehicle: Vehicle) {
    const prevLeftSpeed = vehicle.leftSpeed;
    const prevRightSpeed = vehicle.rightSpeed;

    // update vehicle wheel speeds based on actions
    if (this.actions["forward"]) {
      vehicle.leftSpeed += 60 * dt;
      vehicle.rightSpeed += 60 * dt;
    }
    if (this.actions["reverse"]) {
      vehicle.leftSpeed -= 60 * dt;
      vehicle.rightSpeed -= 60 * dt;
    } 
    if (this.actions["left"]) {
      vehicle.leftSpeed -= 80 * dt;
      vehicle.rightSpeed += 80 * dt;
    }
    if (this.actions["right"]) {
      vehicle.leftSpeed += 80 * dt;
      vehicle.rightSpeed -= 80 * dt;
    }

    // lerp to target speed
    if (!this.actions["forward"] && !this.actions["reverse"] && !this.actions["left"] && !this.actions["right"]) {
      if (vehicle.leftSpeed > 0 && vehicle.leftSpeed < 10) vehicle.leftSpeed = 0;
      else if (vehicle.leftSpeed < 0 && vehicle.leftSpeed > -10) vehicle.leftSpeed = 0;
      else if (vehicle.rightSpeed > 0 && vehicle.rightSpeed < 10) vehicle.rightSpeed = 0;
      else if (vehicle.rightSpeed < 0 && vehicle.rightSpeed > -10) vehicle.rightSpeed = 0;  
      else {
        vehicle.leftSpeed -= vehicle.leftSpeed * 0.9 * dt;
        vehicle.rightSpeed -= vehicle.rightSpeed * 0.9 * dt;
      }
    }

    // clamp speed
    if (vehicle.leftSpeed > MAX_SPEED) vehicle.leftSpeed = MAX_SPEED;
    if (vehicle.leftSpeed < -MAX_SPEED) vehicle.leftSpeed = -MAX_SPEED;
    if (vehicle.rightSpeed > MAX_SPEED) vehicle.rightSpeed = MAX_SPEED;
    if (vehicle.rightSpeed < -MAX_SPEED) vehicle.rightSpeed = -MAX_SPEED;

    // if vehicle speed is almost 0, set it to 0
    if (Math.abs(vehicle.leftSpeed) < SLOWEST) vehicle.leftSpeed = 0;
    if (Math.abs(vehicle.rightSpeed) < SLOWEST) vehicle.rightSpeed = 0;

    return prevLeftSpeed !== vehicle.leftSpeed || prevRightSpeed !== vehicle.rightSpeed;
  }
}
