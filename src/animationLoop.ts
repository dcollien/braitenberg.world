const requestAnimationFrame = window.requestAnimationFrame ||
  (callback => window.setTimeout(callback, 1000 / 60))
;

const cancelAnimationFrame = window.cancelAnimationFrame ||
  window.clearTimeout
;

export default class AnimationLoop {
  canvas: HTMLCanvasElement;
  running: boolean;
  frameRequest: number | null;
  lastStep: number;

  constructor(canvas: HTMLCanvasElement | string) {
    if (new.target === AnimationLoop) {
      throw new TypeError("Cannot construct an abstract class");
    }

    if (typeof canvas === 'string') {
      const canvasElt = document.getElementById(canvas);
      if (!canvasElt || !(canvasElt instanceof HTMLCanvasElement)) throw new Error(`Unable to find element with ID: ${canvas}`);
      this.canvas = canvasElt;
    } else {
      this.canvas = canvas;
    }

    this.running = false;
    this.frameRequest = null;
    this.lastStep = Date.now();
  }

  update(_dt: number): boolean {
    throw new TypeError("Not Implemented: update method is required");
  }

  draw(_canvas: HTMLCanvasElement) {
    throw new TypeError("Not Implemented: draw method is required");
  }

  run() {
    if (this.running) return;

    this.running = true;
    const processFrame = () => {
      this.step();
      this.frameRequest = requestAnimationFrame(processFrame);
    };

    this.lastStep = Date.now();
    this.frameRequest = requestAnimationFrame(processFrame);
  }

  stop() {
    if (this.frameRequest) cancelAnimationFrame(this.frameRequest);
    this.frameRequest = null;
    this.running = false;
  }

  step() {
    const now = Date.now();
    const dt = (now - this.lastStep) / 1000;
    this.lastStep = now;
    if (this.update(dt) !== false) {
      this.draw(this.canvas);
    }
  }
}
