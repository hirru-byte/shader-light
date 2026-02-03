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
    light,
    shininess,
    diffuseness,
    iorR,
    iorY,
    iorG,
    iorC,
    iorB,
    iorP,
    saturation,
    chromaticAberration,
    refraction
  } = useControls({
    light: {
      x: -1.0,
      y: 1.0,
      z: 1.0,
    },
    diffuseness: {
      value: 0.2,
    },
    shininess: {
      value: 40.0,
    },
    ior: folder({
      iorR: { min: 1.0, max: 2.333, step: 0.001, value: 1.15 },
      iorY: { min: 1.0, max: 2.333, step: 0.001, value: 1.16 },
      iorG: { min: 1.0, max: 2.333, step: 0.001, value: 1.18 },
      iorC: { min: 1.0, max: 2.333, step: 0.001, value: 1.22 },
      iorB: { min: 1.0, max: 2.333, step: 0.001, value: 1.22 },
      iorP: { min: 1.0, max: 2.333, step: 0.001, value: 1.22 },
    }),
    saturation: { value: 1.08, min: 1, max: 1.25, step: 0.01 },
    chromaticAberration: {
      value: 0.6,
      min: 0,
      max: 1.5,
      step: 0.01,
    },
    refraction: {
      value: 0.4,
      min: 0,
      max: 1,
      step: 0.01,
    },
  })

  const uniforms = useMemo(() => ({
    uTexture: { value: null },
    uIorR: { value: 1.0 },
    uIorG: { value: 1.0 },
    uIorB: { value: 1.0 },
    uIorY: { value: 1.0 },
    uIorC: { value: 1.0 },
    uIorP: { value: 1.0 },
    uSaturation: { value: 0.0 },
    uChromaticAberration: { value: 1.0 },
    uRefractPower: { value: 0.2 },
    uShininess: { value: 40.0 },
    uDiffuseness: { value: 0.2 },
    uLight: {
      value: new THREE.Vector3(-1.0, 1.0, 1.0),
    },
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

    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uDiffuseness.value = diffuseness;
    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uShininess.value = shininess;
    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uLight.value = new THREE.Vector3(
      light.x,
      light.y,
      light.z
    );

    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uIorR.value = iorR;
    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uIorG.value = iorG;
    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uIorB.value = iorB;
    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uIorY.value = iorY;
    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uIorC.value = iorC;
    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uIorP.value = iorP;

    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uSaturation.value = saturation;
    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uChromaticAberration.value = chromaticAberration;
    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uRefractPower.value = refraction;

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
        <torusGeometry args={[3, 1, 32, 100]} />
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