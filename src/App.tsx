// Top-level layout: the 3D <Canvas> holding the scene, with the 2D HUD layered over it.
import { Canvas } from "@react-three/fiber";
import Scene from "@/scene/Scene";
import Hud from "@/ui/Hud";

export default function App() {
  return (
    <>
      <Canvas camera={{ position: [0, 12, 9], fov: 50 }}>
        <Scene />
      </Canvas>
      <Hud />
    </>
  );
}
