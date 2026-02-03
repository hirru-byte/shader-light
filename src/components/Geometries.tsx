import vertexShader from '../../public/light/vertexShader.glsl'
import fragmentShader from '../../public/light/fragmentShader.glsl'
import { generateUUID } from 'three/src/math/MathUtils.js';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { range } from '../../utils/render';
import { useFBO } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { folder, useControls } from 'leva';

const Geometries = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const mainRenderTarget = useFBO();

  const {
    iorR,
    iorG,
    iorB,
    saturation,
    chromaticAberration,
    refractPower,
  } = useControls({
    ior: folder({
      title: 'IOR',
      iorR: { value: 1.15, min: 1.0, max: 2.333, step: 0.001 },
      iorG: { value: 1.18, min: 1.0, max: 2.333, step: 0.001 },
      iorB: { value: 1.22, min: 1.0, max: 2.333, step: 0.001 },
    }),
    saturation: { value: 0.5, min: 0.0, max: 1.0, step: 0.01 },
    chromaticAberration: { value: 0.5, min: 0.0, max: 1.5, step: 0.01 },
    refractPower: { value: 1.06, min: 1, max: 1.25, step: 0.01 },
  });

  const uniforms = useMemo(() => ({
    uTexture: { value: null },
    uIorR: { value: 1.0 },
    uIorG: { value: 1.0 },
    uIorB: { value: 1.0 },
    uSaturation: { value: 0.0 },
    uChromaticAberration: { value: 1.0 },
    uRefractPower: { value: 0.2 },
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

    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTexture.value = mainRenderTarget.texture;

    gl.setRenderTarget(null);
    meshRef.current.visible = true;

    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uIorR.value = iorR;
    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uIorG.value = iorG;
    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uIorB.value = iorB;

    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uSaturation.value = saturation;
    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uChromaticAberration.value = chromaticAberration;
    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uRefractPower.value = refractPower;

  });

  const columns = range(-7.5, 7.5, 2.5);
  const rows = range(-7.5, 7.5, 2.5);

  // const randomColor = useMemo(() => {
  //   return () => new THREE.Color(Math.random(), Math.random(), Math.random());
  // }, []);

  return (
    <>
      <color attach="background" args={['#000']} />
      <group ref={groupRef}>
        {columns.map((col, i) =>
          rows.map((row, j) => (
            <mesh key={`${col}-${row}`} position={[col, row, -4]}>
              <icosahedronGeometry args={[0.333, 8]} />
              <meshStandardMaterial color={'white'} />
            </mesh>
          ))
        )}
      </group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2.84, 20]} />
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