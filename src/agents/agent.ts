import { Vehicle } from "../scene/vehicle";

export class Agent {
  update(_dt: number, _vehicle: Vehicle) {
    return false;
  }

  draw(_ctx: CanvasRenderingContext2D, _vehicle: Vehicle) {
  }
}
