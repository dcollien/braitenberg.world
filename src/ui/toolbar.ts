interface ToolbarProps {
  agents: {
    name: string;
    type: string;
  }[],
  onAgentChange: (agent: string) => void
}

export function uiToolbar({ agents, onAgentChange }: ToolbarProps): [HTMLDivElement, (value: string) => void] {
  const container = document.createElement("div");
  container.id = "toolbar";

  const spacer = document.createElement("div");
  spacer.className = "spacer";

  const status = document.createElement("div");
  status.id = "status";
  status.innerHTML = "Click on the grid to place and remove lamps. Press ESC to reset the vehicle position. Use arrow keys to drive the vehicle.";

  const select = document.createElement("select");
  select.id = "agent";
  select.innerHTML = agents.map((agent) => `<option value="${agent.type}">${agent.name}</option>`).join("");
  select.addEventListener("change", (event) => {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    const agentName = agents.find((a) => a.type === value)?.name;
    onAgentChange(value);

    if (value === "keyboard") {
      status.innerHTML = "Use arrow keys to drive the vehicle";
    } else {
      status.innerHTML = `Agent "${agentName}" is driving the vehicle with ${value}.`;
    }
  });

  spacer.appendChild(select);
  container.appendChild(spacer);
  container.appendChild(status);

  const setSelected = (value: string) => {
    select.value = value;
  }

  return [container, setSelected];
}