// Everything inside the <Canvas>: lights, the keyboard, a floor grid and camera controls.
import { OrbitControls, Grid } from "@react-three/drei";
import Keyboard from "@/scene/keyboard/Keyboard";

// Everything rendered inside <Canvas>. App.tsx owns the Canvas itself.
export default function Scene() {
  return (
    <>
      <color attach="background" args={["#111827"]} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 6]} intensity={1.5} />

      <Keyboard />

      <Grid
        position={[0, -0.8, 0]}
        args={[20, 20]}
        cellColor="#374151"
        sectionColor="#6b7280"
        fadeDistance={40}
        infiniteGrid
      />

      <OrbitControls makeDefault />
    </>
  );
}
