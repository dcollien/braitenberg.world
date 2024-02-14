import { KeyboardAgent } from "./agents/keyboard";
import { BraitenbergAgent } from "./agents/braitenberg";
import { Simulation } from "./simulation";
import { uiToolbar } from "./ui/toolbar";

console.info(String.raw`%c
_                                                       
|_) ._ _. o _|_  _  ._  |_   _  ._ _          _  ._ |  _|
|_) | (_| |  |_ (/_ | | |_) (/_ | (_| o \/\/ (_) |  | (_|
                                   _|                    
https://github.com/dcollien/braitenberg.world
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
    "agent": new BraitenbergAgent("curiosity", 220)
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

    const { x: gridX, y: gridY } = simulation.world.toGrid((offsetX / simulation.zoom - simulation.dimensions.width / 2 + simulation.camera.x), (offsetY / simulation.zoom - simulation.dimensions.height / 2  + simulation.camera.y));
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
  window.addEventListener("wheel", (event) => {
    simulation.setZoom(simulation.zoom + event.deltaY * -0.001);
  });

  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });

  canvas.addEventListener("mousedown", (event) => {
    // if right drag
    if (event.button === 2) {
      simulation.pan.isPanning = true;
      event.preventDefault();
    }
  });

  canvas.addEventListener("mouseout", () => {
    simulation.pan.isPanning = false;
  });

  window.addEventListener("mouseup", () => {
    simulation.pan.isPanning = false;
  });

  window.addEventListener("mousemove", (event) => {
    if (simulation.pan.isPanning) {
      simulation.pan.x -= event.movementX / simulation.zoom;
      simulation.pan.y -= event.movementY / simulation.zoom;
      simulation.repaint = true;
    }
  });

  if (canvas.width < 800) {
    simulation.zoom = 0.5;
  }

  simulation.run();
};

window.addEventListener("load", init);
document.getElementById("github")?.style.setProperty("display", "block");
