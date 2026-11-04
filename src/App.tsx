// Top-level layout: the 3D <Canvas> holding the scene, with the 2D HUD layered over it.
import { Canvas } from "@react-three/fiber";
import Scene from "@/scene/Scene";
import { useOsTheme } from "@/hooks/useOsTheme";
import Hud from "@/ui/Hud";

export default function App() {
  useOsTheme();
  return (
    <>
      {/* The camera starts where a person's eyes would be, seated at the desk. Units are metres. */}
      <Canvas dpr={[1, 2]} camera={{ position: [0, 1.2, 0.78], fov: 50, near: 0.05, far: 50 }}>
        <Scene />
      </Canvas>
      <Hud />
    </>
  );
}
