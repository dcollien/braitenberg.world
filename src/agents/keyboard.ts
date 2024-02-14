import { DriverAgent } from "./driver";

const KEYBINDINGS: { [key:string]: string } = {
  "ArrowUp": "forward",
  "ArrowDown": "reverse",
  "ArrowLeft": "left",
  "ArrowRight": "right",
};

export class KeyboardAgent extends DriverAgent {
  constructor() {
    super();
  }

  onKeyDown = (event: KeyboardEvent) => {
    event.preventDefault();
    const action = KEYBINDINGS[event.key];
    if (action) this.actions[action] = true;
  }

  onKeyUp = (event: KeyboardEvent) => {
    event.preventDefault();
    const action = KEYBINDINGS[event.key];
    if (action) this.actions[action] = false;
  }
}
