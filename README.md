# braitenberg.world
This project is a simulation of Braitenberg Vehicles implemented in TypeScript (no other dependencies, but it uses vite to build).


## What are Braitenberg Vehicles?
Braitenberg Vehicles are hypothetical simple vehicles introduced by the neuroscientist Valentino Braitenberg. These vehicles demonstrate how simple interactions between sensors, motors, and the environment can produce complex behaviors resembling those observed in living organisms.

Braitenberg Vehicles are equipped with sensors and motors, with wiring that connects sensors to motors. The vehicles respond to sensory input in a way that seems to exhibit complex behavior. This concept helps in understanding how simple mechanisms can lead to seemingly intelligent actions.

For more information about Braitenberg Vehicles, refer to the [Wikipedia page](https://en.wikipedia.org/wiki/Braitenberg_vehicle).

# Meet the Vehicles
Anthropomorphising these basic agent setups helps us understand how they respond to their surroundings. By thinking of them as experiencing emotions like fear, aggression, love, and curiosity, we create a framework that's easy to grasp. But it's crucial to remember that these robots don't really feel emotions — they're wired to react in certain ways based on what they sense.

## The Coward (fear, hiding):
In the coward configuration, the left motor speed is determined by the intensity of the left sensor, and the right motor speed is excited (increased) by the intensity of the right sensor. Both motor speeds are directly proportional to their respective sensor intensities, causing the robot to move away faster when it senses more light (towards darkness). 

There is a low level of ambient light, so the robots will always be moving in darkness, albiet very slowly in the case of "the coward".

  - Left sensor connects to left motor, increasing its speed the brighter it senses.
  - Right sensor connects to right motor, increasing its speed the brighter it senses.
  - Vehicle moves faster when it senses more light, slower when it senses less light.
  - Vehicle quickly turns away from the light, hides out in darkness.

## The Aggressor (hate, aggression):
For the aggressor configuration, the left motor speed is determined by the intensity of the right sensor, while the right motor speed is excited (increased) by the intensity of the left sensor. Both motor speeds are directly proportional to their respective sensor intensities, causing the robot to move faster towards the direction where it senses more light. 

  - Left sensor connects to right motor, increasing its speed the brighter it senses.
  - Right sensor connects to left motor, increasing its speed the brighter it senses.
  - Vehicle moves faster when it senses more light, slower when it senses less light.
  - Vehicle turns towards the light and accelerates towards it; smash!

## The Lover (love, affection):
In the lover configuration, the robot's behavior is wired to move slower when it senses light. The left motor speed is inhibited by the intensity of the left sensor, and the right motor speed is inhibited by the intensity of the right sensor. Both motor speeds are inversely proportional to their respective sensor intensities, causing the robot to move slower in the presence of light, but turning towards where it senses more light.

  - Left sensor connects to left motor, decreasing its speed the brighter it senses.
  - Right sensor connects to right motor, decreasing its speed the brighter it senses.
  - Vehicle moves slower when it senses more light, faster when it senses less light.
  - Vehicle turns towards the light and slows towards it, often stopping on the light.

## The Explorer (nosy, curious):
Lastly, for the explorer configuration, the robot's behavior is wired to move slower when it senses darkness. The left motor speed is inhibited by the intensity of the right sensor, and the right motor speed is inhibited by the intensity of the left sensor. Both motor speeds are inversely proportional to their respective sensor intensities, causing the robot to move slower in the presence of darkness, turning away from where it senses more light (towards darkness).

  - Left sensor connects to right motor, decreasing its speed the darker it senses.
  - Right sensor connects to left motor, decreasing its speed the darker it senses.
  - Vehicle moves slower when it senses more light, faster when it senses less light.
  - Vehicle slowly turns away from the light, preferring to saunter through darkness.

# Building and stuff
This project has zero dependencies except for Typescript and the browser.

I use vite to build it.

All you really need:

Development (hot reload):
```
npm run dev
```

Build:
```
npm run build
```
