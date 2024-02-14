import { KeyboardAgent } from "./agents/keyboard";
import { BraitenbergAgent } from "./agents/braitenberg";
import { Simulation } from "./simulation";
import { uiToolbar } from "./ui/toolbar";

console.info(String.raw`%c
_                                                       
|_) ._ _. o _|_  _  ._  |_   _  ._ _          _  ._ |  _|
|_) | (_| |  |_ (/_ | | |_) (/_ | (_| o \/\/ (_) |  | (_|
                                   _|                    
By David Collien
(mе@dсоllіеո.com)
`, "font-family:monospace; color:#00ffff; font-size: 12px;");

const DRIVER = new KeyboardAgent();

const AGENTS = [
  {
    "name": "Lover",
    "type": "love",
    "agent": new BraitenbergAgent("love", 250)
  },
  {
    "name": "Coward",
    "type": "fear",
    "agent": new BraitenbergAgent("fear", 400)
  },
  {
    "name": "Aggressor",
    "type": "aggression",
    "agent": new BraitenbergAgent("aggression", 600)
  },
  {
    "name": "Explorer",
    "type": "curiosity",
    "agent": new BraitenbergAgent("explore", 220)
  },
  {
    "name": "Drive with Keyboard",
    "type": "keyboard",
    "agent": DRIVER
  }
]

const init = () => {
  const canvas = document.createElement("canvas");
  const simulation = new Simulation(canvas, DRIVER);

  const [toolbar, setSelected]= uiToolbar({
    agents: AGENTS,
    onAgentChange: (agent: string) => {
      const selected = AGENTS.find((a) => a["type"] === agent);
      if (selected) {
        simulation.agent = selected["agent"];
      }
    }
  })
  setSelected("keyboard");
  
  document.body.appendChild(canvas);
  document.body.appendChild(toolbar);

  simulation.lamps.add(800, 200);

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    simulation.dimensions = { width: canvas.width, height: canvas.height };
    simulation.repaint = true;
  }

  window.addEventListener("resize", resize);
  resize();

  window.addEventListener("blur", () => simulation.stop());
  window.addEventListener("focus", () => simulation.run());

  canvas.addEventListener("click", (event) => {
    const { offsetX, offsetY } = event;

    const { x: gridX, y: gridY } = simulation.world.toGrid(offsetX - simulation.dimensions.width / 2 + simulation.camera.x, offsetY - simulation.dimensions.height / 2  + simulation.camera.y);
    const { x, y } = simulation.world.fromGrid(gridX, gridY)

    simulation.lamps.toggle(x, y);
    simulation.repaint = true;
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      simulation.vehicle.reset();
      simulation.breadcrumbs.reset();
      simulation.repaint = true;
    }

    DRIVER.onKeyDown(event)
  });
  window.addEventListener("keyup", (event) => DRIVER.onKeyUp(event));

  simulation.run();
};

window.addEventListener("load", init);
