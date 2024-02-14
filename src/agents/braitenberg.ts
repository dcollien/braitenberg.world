import { Vehicle } from "../scene/vehicle";
import { Agent } from "./agent";

export type BraitenbergConfiguration = "fear" | "curiosity" | "aggression" | "love";

const MAX_SPEED = 300;
const MIN_SPEED_DELTA = 0.01;

export class BraitenbergAgent extends Agent {
  configuration: BraitenbergConfiguration;
  maxSpeed: number;
  minSpeed: number;

  constructor(configuration: BraitenbergConfiguration, maxSpeed: number = MAX_SPEED, minSpeed: number = 0) {
    super();
    this.configuration = configuration;
    this.maxSpeed = maxSpeed;
    this.minSpeed = minSpeed;
  }

  update(dt: number, vehicle: Vehicle) {
    const prevLeftSpeed = vehicle.leftSpeed;
    const prevRightSpeed = vehicle.rightSpeed;

    const rightIntensity = vehicle.sensors.right;
    const leftIntensity = vehicle.sensors.left;

    let targetLeftSpeed = 0;
    let targetRightSpeed = 0;

    if (this.configuration === "fear") {
      // = +
      targetLeftSpeed  = leftIntensity * this.maxSpeed;
      targetRightSpeed = rightIntensity * this.maxSpeed;
    } else if (this.configuration === "aggression") {
      // X +
      targetLeftSpeed  = rightIntensity * this.maxSpeed;
      targetRightSpeed = leftIntensity * this.maxSpeed;
    } else if (this.configuration === "love") {
      // = -
      targetLeftSpeed  = this.maxSpeed - leftIntensity * this.maxSpeed;
      targetRightSpeed = this.maxSpeed - rightIntensity * this.maxSpeed;
    } else if (this.configuration === "curiosity") {
      // X -
      targetLeftSpeed = this.maxSpeed - rightIntensity * this.maxSpeed;
      targetRightSpeed = this.maxSpeed - leftIntensity * this.maxSpeed;
    }

    // lerp to target speed
    vehicle.leftSpeed += (targetLeftSpeed - vehicle.leftSpeed) * 0.9 * dt;
    vehicle.rightSpeed += (targetRightSpeed - vehicle.rightSpeed) * 0.9 * dt;

    if (vehicle.leftSpeed > this.maxSpeed) vehicle.leftSpeed = this.maxSpeed;
    if (vehicle.leftSpeed < -this.maxSpeed) vehicle.leftSpeed = -this.maxSpeed;
    if (vehicle.rightSpeed > this.maxSpeed) vehicle.rightSpeed = this.maxSpeed;
    if (vehicle.rightSpeed < -this.maxSpeed) vehicle.rightSpeed = -this.maxSpeed;

    const leftSign = Math.sign(vehicle.leftSpeed);
    const rightSign = Math.sign(vehicle.rightSpeed);

    // if vehicle speed is almost the minimum, set it to the minimum
    const vehicleSpeed = Math.max(Math.abs(vehicle.leftSpeed), Math.abs(vehicle.rightSpeed));
    if (vehicleSpeed < this.minSpeed + MIN_SPEED_DELTA) {
      if (this.minSpeed === 0) {
        vehicle.leftSpeed = 0;
        vehicle.rightSpeed = 0;
      } else {
        // the larger of the two speeds will be set to the minimum
        // this is to force turning and prevent the vehicle from getting stuck
        if (Math.abs(vehicle.leftSpeed) > Math.abs(vehicle.rightSpeed)) {
          vehicle.leftSpeed = this.minSpeed * leftSign;
        } else {
          vehicle.rightSpeed = this.minSpeed * rightSign;
        }
      }
    }

    return prevLeftSpeed !== vehicle.leftSpeed || prevRightSpeed !== vehicle.rightSpeed;
  }

  draw(ctx: CanvasRenderingContext2D, vehicle: Vehicle) {
    ctx.save();
    ctx.translate(vehicle.x, vehicle.y);
    // Drawn pointing up, so rotate to correct angle
    ctx.rotate(vehicle.rotation + Math.PI / 2);
    ctx.translate(0, -vehicle.centerY);

    const sensorOffset = 5;
    const sideOffset = 12;
    const motorOffset = 20;
    const left = -vehicle.width / 2;
    const right = vehicle.width / 2;
    const leftMargin = left + sideOffset;
    const rightMargin = right - sideOffset;
    const bottomMargin = vehicle.height / 2 - motorOffset;
    const topMargin = -vehicle.height / 2 + sensorOffset;

    const leftColorPos = `rgba(10, 255, 200, ${vehicle.sensors.left})`;
    const rightColorPos = `rgba(10, 255, 200, ${vehicle.sensors.right})`;
    const leftColorNeg = `rgba(255, 100, 100, ${vehicle.sensors.left})`;
    const rightColorNeg = `rgba(255, 100, 100, ${vehicle.sensors.right})`;
    const bgColor = "rgba(0, 0, 0, 0.5)";

    const drawParallel = (lColor: string, rColor: string) => {
      ctx.strokeStyle = lColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(leftMargin, topMargin);
      ctx.lineTo(leftMargin, bottomMargin);
      ctx.lineTo(left, bottomMargin);
      ctx.stroke();

      ctx.strokeStyle = rColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rightMargin, topMargin);
      ctx.lineTo(rightMargin, bottomMargin);
      ctx.lineTo(right, bottomMargin);
      ctx.stroke();
    }

    const drawCrossover = (lColor: string, rColor: string) => {
      ctx.strokeStyle = lColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(leftMargin, topMargin);
      ctx.lineTo(rightMargin, bottomMargin);
      ctx.lineTo(right, bottomMargin);
      ctx.stroke();

      ctx.strokeStyle = rColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rightMargin, topMargin);
      ctx.lineTo(leftMargin, bottomMargin);
      ctx.lineTo(left, bottomMargin);
      ctx.stroke();
    }

    const drawPositive = (lColor: string, rColor: string) => {
      // write + symbol in text
      ctx.font = "bold 12px Arial";
      ctx.fillStyle = lColor;

      ctx.fillText("+", leftMargin - 6, bottomMargin + 12);
      
      ctx.fillStyle = rColor;
      ctx.fillText("+", rightMargin, bottomMargin + 12);
    }

    const drawNegative = (lColor: string, rColor: string) => {
      // write - symbol in text
      ctx.font = "bold 12px Arial";
      
      ctx.fillStyle = lColor;
      ctx.fillText("-", leftMargin - 6, bottomMargin + 12);

      ctx.fillStyle = rColor;
      ctx.fillText("-", rightMargin, bottomMargin + 12);
    }

    if (this.configuration === "fear") {
      drawParallel(bgColor, bgColor);
      drawParallel(leftColorPos, rightColorPos);
      drawPositive(bgColor, bgColor);
      drawPositive(leftColorPos, rightColorPos);
    } else if (this.configuration === "aggression") {
      drawCrossover(bgColor, bgColor);
      drawCrossover(leftColorPos, rightColorPos);
      drawPositive(bgColor, bgColor);
      drawPositive(rightColorPos, leftColorPos);
    } else if (this.configuration === "love") {
      drawParallel(bgColor, bgColor);
      drawParallel(leftColorNeg, rightColorNeg);
      drawNegative(bgColor, bgColor);
      drawNegative(leftColorNeg, rightColorNeg);
    } else if (this.configuration === "curiosity") {
      drawCrossover(bgColor, bgColor);
      drawCrossover(leftColorNeg, rightColorNeg);
      drawNegative(bgColor, bgColor);
      drawNegative(rightColorNeg, leftColorNeg);
    }
    
    ctx.restore();
  };
}
