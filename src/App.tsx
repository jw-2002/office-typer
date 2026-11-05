// Top-level layout: the 3D <Canvas> holding the scene, with the 2D HUD layered over it.
import { Canvas } from "@react-three/fiber";
import { cameraPoses } from "@/scene/camera/cameraViews";
import { createCanvasEvents } from "@/scene/camera/canvasEvents";
import Scene from "@/scene/Scene";
import { useDisplayTheme, useOsTheme } from "@/hooks/useOsTheme";
import { useDisplayStore } from "@/state/view/displayStore";
import GoblinOverlay from "@/ui/goblin/GoblinOverlay";
import Hud from "@/ui/hud/Hud";

export default function App() {
  useOsTheme();
  useDisplayTheme();
  const quality = useDisplayStore((state) => state.quality);
  return (
    <>
      {/* The camera starts close to the screen, as if seated at the desk. Units are metres. */}
      <Canvas
        className="scene-canvas"
        shadows="percentage"
        events={createCanvasEvents}
        // Low quality draws at normal resolution even on a high-density screen.
        dpr={quality === "low" ? 1 : [1, 2]}
        camera={{ position: [...cameraPoses.seated.position], fov: 50, near: 0.05, far: 50 }}
      >
        <Scene />
      </Canvas>
      <Hud />
      <GoblinOverlay />
    </>
  );
}
