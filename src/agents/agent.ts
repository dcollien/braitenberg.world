import { Vehicle } from "../scene/vehicle";

export class Agent {
  update(_dt: number, _vehicle: Vehicle, _lamps: { x: number; y: number; }[] = []) {
    return false;
  }

  draw(_ctx: CanvasRenderingContext2D, _vehicle: Vehicle) {
  }
}
