import { Vehicle } from "../scene/vehicle";
import { Agent } from "./agent";

export type BraitenbergConfiguration = "fear" | "explore" | "aggression" | "love";

const MAX_SPEED = 300;
const MIN_SPEED = 0.001;

export class BraitenbergAgent extends Agent {
  configuration: BraitenbergConfiguration;
  maxSpeed: number;
  minSpeed: number;

  constructor(configuration: BraitenbergConfiguration, maxSpeed: number = MAX_SPEED, minSpeed: number = MIN_SPEED) {
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
    } else if (this.configuration === "explore") {
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

    // if vehicle speed is almost 0, set it to 0
    if (Math.abs(vehicle.leftSpeed) < this.minSpeed) vehicle.leftSpeed = 0;
    if (Math.abs(vehicle.rightSpeed) < this.minSpeed) vehicle.rightSpeed = 0;


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

    const drawPositive = () => {
      ctx.fillStyle = "rgba(0, 100, 0, 0.8)";
      // write + symbol in text
      ctx.font = "bold 12px Arial";
      ctx.fillText("+", leftMargin - 6, bottomMargin + 12);
      ctx.fillText("+", rightMargin, bottomMargin + 12);
    }

    const drawNegative = () => {
      ctx.fillStyle = "rgba(100, 0, 0, 0.8)";
      // write - symbol in text
      ctx.font = "bold 12px Arial";
      ctx.fillText("-", leftMargin - 6, bottomMargin + 12);
      ctx.fillText("-", rightMargin, bottomMargin + 12);
    }

    if (this.configuration === "fear") {
      drawParallel(bgColor, bgColor);
      drawParallel(leftColorPos, rightColorPos);
      drawPositive();
    } else if (this.configuration === "aggression") {
      drawCrossover(bgColor, bgColor);
      drawCrossover(leftColorPos, rightColorPos);
      drawPositive();
    } else if (this.configuration === "love") {
      drawParallel(bgColor, bgColor);
      drawParallel(leftColorNeg, rightColorNeg);
      drawNegative();
    } else if (this.configuration === "explore") {
      drawCrossover(bgColor, bgColor);
      drawCrossover(leftColorNeg, rightColorNeg);
      drawNegative();
    }
    
    ctx.restore();
  };
}
