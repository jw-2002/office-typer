// Top-level layout: the 3D <Canvas> holding the scene, with the 2D HUD layered over it.
import { Canvas } from "@react-three/fiber";
import { cameraPoses } from "@/scene/cameraViews";
import { createCanvasEvents } from "@/scene/canvasEvents";
import Scene from "@/scene/Scene";
import { useOsTheme } from "@/hooks/useOsTheme";
import Hud from "@/ui/Hud";

export default function App() {
  useOsTheme();
  return (
    <>
      {/* The camera starts close to the screen, as if seated at the desk. Units are metres. */}
      <Canvas
        events={createCanvasEvents}
        dpr={[1, 2]}
        camera={{ position: [...cameraPoses.seated.position], fov: 50, near: 0.05, far: 50 }}
      >
        <Scene />
      </Canvas>
      <Hud />
    </>
  );
}
