// The light of the day: a sun (or moon) that crosses the sky as the game clock runs, casting shadows across the desk, plus
// a soft ambient light and the colour of the sky. The pure maths is in daylight.ts; this feeds it into the real lights.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, DirectionalLight, HemisphereLight, MathUtils, Vector3 } from "three";
import { timeOfDay } from "@/game/time";
import { useDisplayStore } from "@/state/displayStore";
import { useGameStore } from "@/state/gameStore";
import { daylightAt } from "./daylight";
import { palette } from "./palette";

/** How far from the middle of the room the sun is placed. Only its direction matters for a directional light. */
const DISTANCE = 6;
/** Higher is snappier. The goal moves once a minute, and the lights glide toward it. */
const SPEED = 5;

/** The warm brown of the floor, which bounces light up onto the undersides of things. */
const FLOOR = new Color(palette.floor);

function makeGoal() {
  return {
    position: new Vector3(0, DISTANCE, 0),
    color: new Color(),
    ambientColor: new Color(),
    groundColor: new Color(),
    sky: new Color(),
    intensity: 1,
    ambientIntensity: 0.5,
  };
}

export default function Sun() {
  const quality = useDisplayStore((state) => state.quality);
  const sun = useRef<DirectionalLight>(null!);
  const ambient = useRef<HemisphereLight>(null!);
  const sky = useRef<Color>(null!);

  // Where the lights are heading. Kept in a ref and reused every frame, so nothing is allocated while the game runs.
  const goalRef = useRef(makeGoal());
  const lastMinute = useRef(-1);

  useFrame((_, delta) => {
    const goal = goalRef.current;
    // Work out the goal only when the clock moves on a whole minute, which is once a second.
    const minutes = timeOfDay(useGameStore.getState().stats.secondsPlayed);
    const whole = Math.floor(minutes);
    if (whole !== lastMinute.current) {
      const first = lastMinute.current === -1;
      lastMinute.current = whole;
      const light = daylightAt(minutes);
      goal.position.set(...light.direction).multiplyScalar(DISTANCE);
      goal.color.set(light.color);
      goal.ambientColor.set(light.ambientColor);
      // From below, the light is a dimmer, warmer version of the ambient light, picked up from the floor.
      goal.groundColor.set(light.ambientColor).lerp(FLOOR, 0.6).multiplyScalar(0.7);
      goal.sky.set(light.sky);
      goal.intensity = light.intensity;
      goal.ambientIntensity = light.ambientIntensity;
      // The very first frame jumps straight there, so the game does not open with the light sliding in.
      if (first) {
        sun.current.position.copy(goal.position);
        sun.current.color.copy(goal.color);
        sun.current.intensity = goal.intensity;
        ambient.current.color.copy(goal.ambientColor);
        ambient.current.groundColor.copy(goal.groundColor);
        ambient.current.intensity = goal.ambientIntensity;
        sky.current.copy(goal.sky);
      }
    }

    const blend = 1 - Math.exp(-SPEED * delta);
    sun.current.position.lerp(goal.position, blend);
    sun.current.color.lerp(goal.color, blend);
    sun.current.intensity = MathUtils.lerp(sun.current.intensity, goal.intensity, blend);
    ambient.current.color.lerp(goal.ambientColor, blend);
    ambient.current.groundColor.lerp(goal.groundColor, blend);
    ambient.current.intensity = MathUtils.lerp(ambient.current.intensity, goal.ambientIntensity, blend);
    sky.current.lerp(goal.sky, blend);
  });

  return (
    <>
      <color ref={sky} attach="background" args={["#8ab8e8"]} />
      {/* A hemisphere light fills the room from above with sky colour and from below with floor colour, so shadowed
          places are dim and tinted rather than flat black. */}
      <hemisphereLight ref={ambient} />
      {/* A directional light is like the sun: parallel rays from one direction. It casts the shadows. The shadow
          camera is a box around the room, and the bias stops stripes appearing on surfaces (shadow acne). */}
      <directionalLight
        // A new key rebuilds the light, because a shadow map cannot be resized while it is in use.
        key={quality}
        ref={sun}
        // Low quality has no shadows at all.
        castShadow={quality !== "low"}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-2.4}
        shadow-camera-right={2.4}
        shadow-camera-top={2.4}
        shadow-camera-bottom={-2.4}
        shadow-camera-near={0.5}
        shadow-camera-far={14}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />
    </>
  );
}
