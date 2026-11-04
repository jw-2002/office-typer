// Everything inside the <Canvas>: lights, the office and the camera controls. App.tsx owns the Canvas itself.
import { OrbitControls } from "@react-three/drei";
import CameraRig from "./CameraRig";
import { cameraPoses } from "./cameraViews";
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

      {/* The camera is locked while seated (CameraRig turns the controls off). Once standing you can look around
          and zoom, but only a little: no walking behind the desk. Both poses sit inside these limits. */}
      <OrbitControls
        makeDefault
        target={[...cameraPoses.seated.target]}
        enablePan={false}
        minDistance={0.9}
        maxDistance={3}
        minAzimuthAngle={-1}
        maxAzimuthAngle={1}
        minPolarAngle={0.7}
        maxPolarAngle={1.65}
      />
      <CameraRig />
    </>
  );
}
