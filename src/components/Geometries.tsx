import vertexShader from '../../public/light/vertexShader.glsl'
import fragmentShader from '../../public/light/fragmentShader.glsl'
import { generateUUID } from 'three/src/math/MathUtils.js';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { range } from '../../utils/render';
import { useFBO } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

const Geometries = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const mainRenderTarget = useFBO();

  const uniforms = useMemo(() => ({
    uTexture: { value: null },
    winResolution: {
      value: new THREE.Vector2(
        window.innerWidth,
        window.innerHeight
      ).multiplyScalar(Math.min(window.devicePixelRatio, 2))
    },
  }), []);

  useFrame((state) => {
    const { gl, scene, camera } = state;
    if (!meshRef.current) return;
    meshRef.current.visible = false;
    gl.setRenderTarget(mainRenderTarget);
    gl.render(scene, camera);

    meshRef.current.material.uniforms.uTexture.value = mainRenderTarget.texture;

    gl.setRenderTarget(null);
    meshRef.current.visible = true;

  });

  const columns = range(-7.5, 7.5, 2.5);
  const rows = range(-7.5, 7.5, 2.5);

  return (
    <>
      <color attach="background" args={['#000']} />
      <group ref={groupRef}>
        {columns.map((col, i) =>
          rows.map((row, j) => (
            <mesh key={`${col}-${row}`} position={[col, row, -4]}>
              <icosahedronGeometry args={[0.333, 8]} />
              <meshStandardMaterial color="#6366f1" />
            </mesh>
          ))
        )}
      </group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2.84, 1]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          key={generateUUID()}
          uniforms={uniforms}
        />
      </mesh>
    </>
  );
};

export default Geometries;