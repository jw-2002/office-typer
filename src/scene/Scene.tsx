// Everything inside the <Canvas>: lights, the office and the camera controls. App.tsx owns the Canvas itself.
import { OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import CameraRig from "./CameraRig";
import { cameraPoses } from "./cameraViews";
import DustMotes from "./DustMotes";
import Office from "./Office";
import RewardPopups from "./RewardPopups";
import Sun from "./Sun";
import { useDisplayStore } from "@/state/displayStore";
import { useFitCamera } from "./useFitCamera";

export default function Scene() {
  useFitCamera();
  const quality = useDisplayStore((state) => state.quality);
  return (
    <>
      <Sun />

      <Office />
      <DustMotes />
      <RewardPopups />

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

      {/* Post-processing runs on the finished picture. Bloom makes only the very bright things glow (the lamp, the neon
          strip, the toaster slots; ordinary lit surfaces stay below the threshold), a vignette darkens the corners, and
          the tone mapping that the renderer would normally do has to be added back here. */}
      {/* Low quality drops the glow and the edge smoothing, which are the costliest parts. */}
      <EffectComposer multisampling={quality === "low" ? 0 : 4}>
        <Bloom intensity={quality === "low" ? 0 : 0.9} luminanceThreshold={2.6} luminanceSmoothing={0.2} mipmapBlur />
        <Vignette offset={0.3} darkness={0.5} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </>
  );
}
