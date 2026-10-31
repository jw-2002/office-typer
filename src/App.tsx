import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import Keyboard from "./Keyboard";

export default function App() {
  return (
    <Canvas camera={{ position: [0, 12, 9], fov: 50 }}>
      <color attach="background" args={["#111827"]} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 6]} intensity={1.5} />

      <Keyboard />

      <Grid position={[0, -0.8, 0]} args={[20, 20]} cellColor="#374151" sectionColor="#6b7280" fadeDistance={40} infiniteGrid />

      <OrbitControls makeDefault />
    </Canvas>
  );
}
