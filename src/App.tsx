import { Canvas } from "@react-three/fiber";
import Scene from "@/scene/Scene";

export default function App() {
  return (
    <Canvas camera={{ position: [0, 12, 9], fov: 50 }}>
      <Scene />
    </Canvas>
  );
}
