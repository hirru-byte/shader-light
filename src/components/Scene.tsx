"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Geometries from "./Geometries";

function Box() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6366f1" />
    </mesh>
  );
}

export default function Scene() {
  return (
    <div className="h-screen w-full bg-gray-400">
      <Canvas
        camera={{ position: [0, 0, 6] }} dpr={[1, 2]}
      >
        <ambientLight intensity={1.0} />
        <Geometries />
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}
