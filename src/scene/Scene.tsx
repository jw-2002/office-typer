// Everything inside the <Canvas>: lights, the office and the camera controls. App.tsx owns the Canvas itself.
import { OrbitControls } from "@react-three/drei";
import Office from "./Office";
import { palette } from "./palette";
import { useFitCamera } from "./useFitCamera";

export default function Scene() {
  useFitCamera();
  return (
    <>
      <color attach="background" args={[palette.background]} />

      {/* Ambient light fills every surface evenly; the directional light is the "sun" that gives shape. */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[1.5, 3, 2]} intensity={1.6} />

      <Office />

      {/* Orbiting is limited so you stay at the desk: a little look around, no walking behind the monitor. */}
      <OrbitControls
        makeDefault
        target={[0, 0.93, -0.08]}
        enablePan={false}
        minDistance={0.4}
        maxDistance={1.6}
        minAzimuthAngle={-0.7}
        maxAzimuthAngle={0.7}
        minPolarAngle={0.6}
        maxPolarAngle={1.75}
      />
    </>
  );
}
