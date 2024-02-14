import { World } from "./world";
import { Lamps } from "./lamps";
import { Breadcrumbs } from "./breadcrumbs";

const SENSOR_HEIGHT = 15;
const SENSOR_WIDTH = 10;
const SENSOR_OFFSET_Y = 4;
const SENSOR_OFFSET_X = 5;

const WHEEL_WIDTH = 10;
const WHEEL_HEIGHT = 30;
const WHEEL_OFFSET_Y = 5;
const WHEEL_OFFSET_X = 12;
const AXEL_DIAMETER = 3;
const TREAD_SPACING = 6;
const TREAD_SIZE = 3;

const CHASSIS_RADIUS = 10;

const CHASSIS_COLOR = "#999999";
const WHEEL_COLOR = "#666666";
const TREAD_COLOR = "#555555";
const AXEL_COLOR = "#666666";
const SENSOR_COLOR = "#005500";

const VIEW_ANGLE = Math.PI / 2.2;
const SENSOR_ANGLE = Math.PI / 10;

const MIN_SENSOR_DISTANCE = 25;
const MAX_SENSOR_DISTANCE = 600;
const SENSOR_MULTIPLIER = 180;
const SENSOR_DROPOFF_RATE = 0.07;
const AMBIENT_LIGHT = 0.05;

export class Vehicle {
  x = 0;
  y = 0;
  width = 50;
  height = 80;
  centerY = 20;
  rotation = 0;
  leftTravel = 0;
  rightTravel = 0;
  leftSpeed = 0;
  rightSpeed = 0;

  sensors = {
    left: 0,
    right: 0
  }

  leftSensorAngle = 0;
  rightSensorAngle = 0;

  update(dt: number, world: World, breadcrumbs: Breadcrumbs) {
    const dRotation = (this.leftSpeed - this.rightSpeed) * dt / this.width;
    this.rotation += dRotation

    if (this.rotation > Math.PI) {
      this.rotation -= Math.PI * 2;
    }
    if (this.rotation < -Math.PI) {
      this.rotation += Math.PI * 2;
    }

    const dLeftSpeed = dt * this.leftSpeed;
    this.leftTravel += dLeftSpeed
    this.leftTravel %= WHEEL_HEIGHT;
    
    const dRightSpeed = dt * this.rightSpeed;
    this.rightTravel += dRightSpeed;
    this.rightTravel %= WHEEL_HEIGHT;

    const dX = (this.leftSpeed + this.rightSpeed) / 2 * Math.cos(this.rotation) * dt;
    this.x += dX;

    const dY = (this.leftSpeed + this.rightSpeed) / 2 * Math.sin(this.rotation) * dt;
    this.y += dY;

    const bounds = world.getBounds();

    // find distance to the closest edge
    const dx1 = Math.abs(this.x - bounds.x1);
    const dx2 = Math.abs(this.x - bounds.x2);
    const dy1 = Math.abs(this.y - bounds.y1);
    const dy2 = Math.abs(this.y - bounds.y2);

    const isOutside = this.x < bounds.x1 || this.x > bounds.x2 || this.y < bounds.y1 || this.y > bounds.y2;

    // set world.fade proportional to the distance to the closest edge, if the vehicle is outside the world
    const edgeDistance = Math.min(dx1, dx2, dy1, dy2);
    const outOfBoundsDistance = 200;

    if (edgeDistance < outOfBoundsDistance) {
      world.fade = Math.max(0, Math.min(1, edgeDistance / outOfBoundsDistance));
    }

    if (isOutside) {
      world.fade = 1;
      this.reset();
      breadcrumbs.reset();
    }


    return dX !== 0 || dY !== 0 || dRotation !== 0;
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.leftSpeed = 0;
    this.rightSpeed = 0;
    this.rotation = 0;
  }

  updateSensors(lamps: Lamps) {
    let leftIntensity = 0;
    let rightIntensity = 0;

    const [leftSensor, rightSensor] = this.getSensorPositions();

    let closestDistance = Number.POSITIVE_INFINITY;
    lamps.forEach(lamp => {
      const leftDx = lamp.x - leftSensor.x;
      const leftDy = lamp.y - leftSensor.y;
      const leftSqDistance = leftDx * leftDx + leftDy * leftDy;
      const leftDistance = Math.sqrt(leftSqDistance);
      let leftInverseSqDist = 1 / ((SENSOR_DROPOFF_RATE * leftDistance + 1) ** 2);

      const rightDx = lamp.x - rightSensor.x;
      const rightDy = lamp.y - rightSensor.y;
      const rightSqDistance = rightDx * rightDx + rightDy * rightDy;
      const rightDistance = Math.sqrt(rightSqDistance);
      let rightInverseSqDist = 1 / ((SENSOR_DROPOFF_RATE * rightDistance + 1) ** 2);

      const combinedDistance = leftSqDistance + rightSqDistance;
      const avDistance = Math.sqrt(combinedDistance) / 2;

      if (avDistance > MAX_SENSOR_DISTANCE) {
        return;
      }

      // change intensity according to angle
      let leftAngle = Math.atan2(leftDy, leftDx);
      let rightAngle = Math.atan2(rightDy, rightDx);

      if (avDistance < MIN_SENSOR_DISTANCE) {
        leftIntensity += 1;
        rightIntensity += 1;
      } else {
        leftIntensity += Math.min(1, Math.max(0, (VIEW_ANGLE - Math.abs(leftAngle - this.rotation + SENSOR_ANGLE)) / VIEW_ANGLE) * leftInverseSqDist * SENSOR_MULTIPLIER);
        rightIntensity += Math.min(1, Math.max(0, (VIEW_ANGLE - Math.abs(rightAngle - this.rotation - SENSOR_ANGLE)) / VIEW_ANGLE) * rightInverseSqDist * SENSOR_MULTIPLIER);  
      }

      if (avDistance < closestDistance) {
        closestDistance = avDistance;

        this.leftSensorAngle = leftAngle;
        this.rightSensorAngle = rightAngle;
      }
    });

    this.sensors.left = Math.min(1, Math.max(AMBIENT_LIGHT, leftIntensity));
    this.sensors.right = Math.min(1, Math.max(AMBIENT_LIGHT, rightIntensity));
  }

  draw(ctx: CanvasRenderingContext2D) {
    const vehicleChassis = {
      x1: -this.width / 2,
      y1: -this.height / 2,
      x2: this.width / 2,
      y2: this.height / 2
    };
    
    ctx.save();
    ctx.translate(this.x, this.y);

    // Drawn pointing up, so rotate to correct angle
    ctx.rotate(this.rotation + Math.PI / 2);
    ctx.translate(0, -this.centerY);

    // draw chassis
    ctx.fillStyle = CHASSIS_COLOR;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    const cornerRadius = CHASSIS_RADIUS;
    const chassisPath = new Path2D();
    chassisPath.moveTo(vehicleChassis.x1 + cornerRadius, vehicleChassis.y1);
    chassisPath.lineTo(vehicleChassis.x2 - cornerRadius, vehicleChassis.y1);
    chassisPath.arcTo(vehicleChassis.x2, vehicleChassis.y1, vehicleChassis.x2, vehicleChassis.y1 + cornerRadius, cornerRadius);
    chassisPath.lineTo(vehicleChassis.x2, vehicleChassis.y2 - cornerRadius);
    chassisPath.arcTo(vehicleChassis.x2, vehicleChassis.y2 , vehicleChassis.x2 - cornerRadius, vehicleChassis.y2 , cornerRadius);
    chassisPath.lineTo(vehicleChassis.x1 + cornerRadius, vehicleChassis.y2 );
    chassisPath.arcTo(vehicleChassis.x1, vehicleChassis.y2 , vehicleChassis.x1, vehicleChassis.y2 - cornerRadius, cornerRadius);
    chassisPath.lineTo(vehicleChassis.x1, vehicleChassis.y1 + cornerRadius);
    chassisPath.arcTo(vehicleChassis.x1, vehicleChassis.y1, vehicleChassis.x1 + cornerRadius, vehicleChassis.y1, cornerRadius);
    ctx.fill(chassisPath);
    // reset shadow
    ctx.shadowBlur = 0;

    // draw wheels
    ctx.fillStyle = WHEEL_COLOR;
    const leftWheelX = -this.width / 2 - WHEEL_OFFSET_X;
    const rightWheelX = this.width / 2 - WHEEL_WIDTH + WHEEL_OFFSET_X;
    const wheelY = this.height / 2 - WHEEL_HEIGHT - WHEEL_OFFSET_Y;

    // Create the gradient for the wheels
    const wheelGradient = ctx.createLinearGradient(leftWheelX, wheelY, leftWheelX, wheelY + WHEEL_HEIGHT);
    wheelGradient.addColorStop(0, TREAD_COLOR);
    wheelGradient.addColorStop(0.5, WHEEL_COLOR);
    wheelGradient.addColorStop(1, TREAD_COLOR);

    // Fill the wheels with the gradient
    ctx.fillStyle = wheelGradient;
    ctx.fillRect(leftWheelX, wheelY, WHEEL_WIDTH, WHEEL_HEIGHT);
    ctx.fillRect(rightWheelX, wheelY, WHEEL_WIDTH, WHEEL_HEIGHT);
    
    // draw tire animation according to "travel"
    for (let y = 0; y < WHEEL_HEIGHT; y += TREAD_SPACING) {
      ctx.fillStyle = TREAD_COLOR;
      const treadOffsetLeft = (WHEEL_HEIGHT - (y + this.leftTravel) % WHEEL_HEIGHT) % WHEEL_HEIGHT;
      const treadOffsetRight = (WHEEL_HEIGHT - (y + this.rightTravel) % WHEEL_HEIGHT) % WHEEL_HEIGHT;

      if (treadOffsetLeft < WHEEL_HEIGHT - TREAD_SPACING) {
        ctx.fillRect(leftWheelX, wheelY + treadOffsetLeft, WHEEL_WIDTH, TREAD_SIZE);
      }
      if (treadOffsetRight < WHEEL_HEIGHT - TREAD_SPACING) {
        ctx.fillRect(rightWheelX, wheelY + treadOffsetRight, WHEEL_WIDTH, TREAD_SIZE);
      }
    }

    // draw axels as rectangles midway through the wheels
    ctx.fillStyle = AXEL_COLOR;
    ctx.fillRect(-this.width / 2, this.height / 2 - WHEEL_HEIGHT / 2 - AXEL_DIAMETER / 2 - WHEEL_OFFSET_Y, WHEEL_WIDTH - WHEEL_OFFSET_X, AXEL_DIAMETER);
    ctx.fillRect(this.width / 2 - WHEEL_WIDTH + WHEEL_OFFSET_X, this.height / 2 - WHEEL_HEIGHT / 2 - AXEL_DIAMETER / 2 - WHEEL_OFFSET_Y, WHEEL_WIDTH - WHEEL_OFFSET_X, AXEL_DIAMETER);

    ctx.restore();

    this.drawSensors(ctx);
    //this.drawSensorDebug(ctx);

  }

  drawSensors(ctx: CanvasRenderingContext2D) {
    const sensorRadius = SENSOR_WIDTH / 2;

    this.getSensorPositions().forEach(({ x, y }, index) => {
      const angle = this.rotation;
      const opacity = index === 0 ? this.sensors.left : this.sensors.right;
      const angleOffset = index === 0 ? -SENSOR_ANGLE : +SENSOR_ANGLE;

      ctx.fillStyle = SENSOR_COLOR;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + angleOffset)

      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";

      ctx.beginPath();
      ctx.arc(0, 0, sensorRadius, 0, Math.PI * 2);
      ctx.rect(-2*sensorRadius, -sensorRadius, SENSOR_HEIGHT - sensorRadius, SENSOR_WIDTH);
      ctx.fill();

      ctx.fillStyle = `rgba(10, 255, 200, ${opacity})`;
      ctx.beginPath();
      ctx.arc(0, 0, sensorRadius, 0, Math.PI * 2);
      ctx.rect(-2*sensorRadius, -sensorRadius, SENSOR_HEIGHT - sensorRadius, SENSOR_WIDTH);
      ctx.fill();

      ctx.shadowBlur = 0;

      ctx.restore();


      const directionIndicatorSize = sensorRadius * 1.2;
      ctx.strokeStyle = `rgba(10, 255, 200, ${opacity + 0.5})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle + VIEW_ANGLE + angleOffset) * directionIndicatorSize, y + Math.sin(angle + VIEW_ANGLE + angleOffset) * directionIndicatorSize);
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle - VIEW_ANGLE + angleOffset) * directionIndicatorSize, y + Math.sin(angle - VIEW_ANGLE + angleOffset) * directionIndicatorSize);
      ctx.stroke();
    });
  }

  drawSensorDebug(ctx: CanvasRenderingContext2D) {
    this.getSensorPositions().forEach(({ x, y }, index) => {
      ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();

      const angle = this.rotation;
      const opacity = index === 0 ? this.sensors.left : this.sensors.right;
      const angleOffset = index === 0 ? -SENSOR_ANGLE : +SENSOR_ANGLE;
      ctx.strokeStyle = `rgba(255, 0, 0, ${opacity + 0.5})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle + VIEW_ANGLE + angleOffset) * 100, y + Math.sin(angle + VIEW_ANGLE + angleOffset) * 100);
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle - VIEW_ANGLE + angleOffset) * 100, y + Math.sin(angle - VIEW_ANGLE + angleOffset) * 100);
      ctx.stroke();

      const objectAngle = index === 0 ? this.leftSensorAngle : this.rightSensorAngle;
      ctx.strokeStyle = `rgba(255, 255, 0, ${opacity + 0.5})`;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(objectAngle) * 100, y + Math.sin(objectAngle) * 100);
      ctx.moveTo(x, y);
      ctx.stroke();
    });
  };

  getSensorPositions() {
    const frontOffset = SENSOR_WIDTH / 2;
    const angle = this.rotation;

    const frontLeft = {
      y: this.y - Math.cos(angle) * (this.width / 2 - SENSOR_OFFSET_X - SENSOR_WIDTH / 2) + Math.sin(angle) * (this.height / 2 + SENSOR_HEIGHT + SENSOR_OFFSET_Y + frontOffset),
      x: this.x + Math.sin(angle) * (this.width / 2 - SENSOR_OFFSET_X - SENSOR_WIDTH / 2) + Math.cos(angle) * (this.height / 2 + SENSOR_HEIGHT + SENSOR_OFFSET_Y + frontOffset),
    };

    const frontRight = {
      y: this.y - Math.cos(angle) * (-this.width / 2 + SENSOR_OFFSET_X + SENSOR_WIDTH / 2) + Math.sin(angle) * (this.height / 2 + SENSOR_HEIGHT + SENSOR_OFFSET_Y + frontOffset),
      x: this.x + Math.sin(angle) * (-this.width / 2 + SENSOR_OFFSET_X + SENSOR_WIDTH / 2) + Math.cos(angle) * (this.height / 2 + SENSOR_HEIGHT + SENSOR_OFFSET_Y + frontOffset),
    };

    return [frontLeft, frontRight];
  }
}