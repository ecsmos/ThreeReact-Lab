import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { addComponent, addEntity, createWorld, query } from 'bitecs';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import * as TSL from 'three/tsl';
import { MeshBasicNodeMaterial, WebGPURenderer } from 'three/webgpu';
import { useSimulationStore } from '../store';

// 1. Define ECS Components
const Position = { x: new Float32Array(100000), y: new Float32Array(100000) };
const Velocity = { x: new Float32Array(100000), y: new Float32Array(100000) };
const Rotation = {
  angle: new Float32Array(100000),
  angularVelocity: new Float32Array(100000),
};
const Scale = { s: new Float32Array(100000) };

const world = createWorld();
const dummy = new THREE.Object3D();

const Background = () => {
  const { viewport, size } = useThree();
  const mouseUniformRef = useRef(TSL.uniform(new THREE.Vector2(0.5, 0.5)));

  const material = useMemo(() => {
    const mat = new MeshBasicNodeMaterial();
    const timeNode = TSL.time;
    const uvNode = TSL.uv();
    const resolutionNode = TSL.vec2(size.width, size.height);
    const mouseNode = mouseUniformRef.current;

    const t = timeNode.mul(0.15); // Consistent with Pixi 0.05 * 3
    const st = uvNode.mul(2.0).sub(1.0);
    const aspect = resolutionNode.x.div(resolutionNode.y);
    const p = st.mul(TSL.vec2(aspect, 1.0));
    const m = mouseNode.mul(2.0).sub(1.0).mul(TSL.vec2(aspect, 1.0));

    const distToMouse = p.sub(m).length();
    const mouseInfluence = TSL.smoothstep(0.6, 0.0, distToMouse);

    // Forest colors: deep green to moss green (затемняем для контраста)
    let colorNode = TSL.mix(
      TSL.vec3(0.01, 0.04, 0.01),
      TSL.vec3(0.02, 0.08, 0.02),
      p.y.mul(0.5).add(0.5),
    );

    // Sunlight rays / shafts (делаем лучи более четкими и яркими)
    const rayAngle = TSL.float(0.5);
    const rayPos = p.x.mul(TSL.cos(rayAngle)).add(p.y.mul(TSL.sin(rayAngle)));
    const rays = TSL.sin(rayPos.mul(8.0).add(t.mul(1.5))) // Чуть медленнее
      .mul(TSL.sin(rayPos.mul(6.0).sub(t.mul(1.0))))
      .mul(0.5)
      .add(0.5);

    colorNode = colorNode.add(
      TSL.vec3(0.4, 0.4, 0.1).mul(rays.pow(4.0)).mul(p.y.add(1.0)),
    );

    // Hash function for leaf particles
    const hash = (p: any) =>
      TSL.fract(TSL.sin(TSL.dot(p, TSL.vec2(12.9898, 78.233))).mul(43758.5453));

    // Add 3 layers of leaf particles
    [1.0, 2.0, 3.0].forEach((i) => {
      const parallax = m.mul(0.02 * i);
      const uvLayer = p
        .mul(1.0 + i * 0.3)
        .add(TSL.vec2(t.mul(0.2 * i), TSL.sin(t.mul(0.1 * i))))
        .sub(parallax);

      const grid = uvLayer.mul(8.0).floor();
      const f = uvLayer.mul(8.0).fract().sub(0.5);

      const h = hash(grid.add(i * 567.89));
      const isLeaf = h.greaterThan(0.96);

      const dist = f.length();
      // sway logic for particles
      const leafBrightness = TSL.float(0.005)
        .div(dist.add(0.01))
        .mul(mouseInfluence.add(1.0));

      const leafColor = TSL.vec3(0.1, 0.3, 0.05).mul(leafBrightness);
      colorNode = TSL.select(isLeaf, colorNode.add(leafColor), colorNode);
    });

    // Soft glow around mouse (sunlight through canopy)
    colorNode = colorNode.add(
      TSL.vec3(0.3, 0.3, 0.1)
        .mul(TSL.exp(distToMouse.mul(-3.0)))
        .mul(0.4),
    );

    mat.colorNode = TSL.vec4(colorNode, 1.0);
    return mat;
  }, [size.width, size.height]);

  useFrame((state) => {
    mouseUniformRef.current.value.set(
      state.pointer.x * 0.5 + 0.5,
      state.pointer.y * 0.5 + 0.5,
    );
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry />
      <primitive object={material} />
    </mesh>
  );
};

const ForestLeaves = () => {
  const { viewport } = useThree();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const intensityUniformRef = useRef(TSL.uniform(0.5));

  const leafSpeed = useSimulationStore((s) => s.leafSpeed);
  const spawnCount = useSimulationStore((s) => s.spawnCount);
  const leafCount = useSimulationStore((s) => s.leafCount);
  const shaderIntensity = useSimulationStore((s) => s.shaderIntensity);
  const showCollisions = useSimulationStore((s) => s.showCollisions);
  const setLeafCount = useSimulationStore((s) => s.setLeafCount);

  const material = useMemo(() => {
    const mat = new MeshBasicNodeMaterial();
    mat.transparent = true;

    new THREE.TextureLoader().load(
      'https://pixijs.com/assets/flowerTop.png',
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        const texNode = TSL.texture(tex);
        const timeNode = TSL.time;

        const instanceId = TSL.instanceIndex;
        const randomOffset = TSL.fract(
          TSL.sin(TSL.float(instanceId).mul(12.9898)).mul(43758.5453),
        ).mul(10.0);
        const t = timeNode.mul(1.5).add(randomOffset);

        const uv = TSL.uv();
        const st = uv.mul(2.0).sub(1.0);

        // КОРРЕКТИРОВКА: Лесной эффект (зеленые оттенки для цветов)
        const pulse = TSL.sin(t.mul(1.5).add(uv.x.mul(5.0)))
          .mul(0.1)
          .add(0.9);
        const leafColor = TSL.vec3(0.4, 0.8, 0.1).mul(pulse);

        // Sunlight highlight (более яркое свечение)
        const sunPos = TSL.vec2(0.5, -0.5);
        const highlight = TSL.dot(st, sunPos).max(0.0).pow(3.0);
        const finalEffect = leafColor.add(
          TSL.vec3(0.8, 0.8, 0.3).mul(highlight),
        );

        mat.colorNode = TSL.vec4(
          TSL.mix(
            texNode.rgb,
            finalEffect.mul(texNode.rgb).mul(2.0),
            intensityUniformRef.current,
          ),
          texNode.a,
        );
        mat.needsUpdate = true;
      },
    );
    return mat;
  }, []);

  const spawnLeaf = useCallback((x: number, y: number) => {
    const eid = addEntity(world);
    addComponent(world, eid, Position);
    addComponent(world, eid, Velocity);
    addComponent(world, eid, Rotation);
    addComponent(world, eid, Scale);

    Position.x[eid] = x;
    Position.y[eid] = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 1.5 + 0.5;
    Velocity.x[eid] = Math.cos(angle) * speed;
    Velocity.y[eid] = Math.sin(angle) * speed;
    Rotation.angle[eid] = Math.random() * Math.PI * 2;
    Rotation.angularVelocity[eid] = (Math.random() - 0.5) * 0.05;
    Scale.s[eid] = 0.3 + Math.random() * 0.4;
  }, []);

  useEffect(() => {
    const count = 30;
    for (let i = 0; i < count; i++) {
      spawnLeaf(
        (Math.random() - 0.5) * viewport.width,
        (Math.random() - 0.5) * viewport.height,
      );
    }
    setLeafCount(count);
  }, [setLeafCount, spawnLeaf, viewport]);

  useFrame((state, delta) => {
    const dt = delta * 60;
    intensityUniformRef.current.value = shaderIntensity;

    const ents = query(world, [Position, Velocity, Rotation]);
    const count = ents.length;

    const { width, height } = state.viewport;
    const halfW = width / 2;
    const halfH = height / 2;
    const velMultiplier = leafSpeed * dt * 0.008;

    for (let i = 0; i < count; i++) {
      const eid = ents[i];

      // Wind sway logic
      Velocity.x[eid] +=
        Math.sin(state.clock.elapsedTime * 0.5 + Position.y[eid] * 0.01) *
        0.001;

      Position.x[eid] += Velocity.x[eid] * velMultiplier;
      Position.y[eid] += Velocity.y[eid] * velMultiplier;
      Rotation.angle[eid] += Rotation.angularVelocity[eid] * dt;

      // Wrap-around with a bit of padding (50 pixels worth of units)
      const padding = 0.5;
      if (Position.x[eid] < -halfW - padding)
        Position.x[eid] += width + padding * 2;
      else if (Position.x[eid] > halfW + padding)
        Position.x[eid] -= width + padding * 2;

      if (Position.y[eid] < -halfH - padding)
        Position.y[eid] += height + padding * 2;
      else if (Position.y[eid] > halfH + padding)
        Position.y[eid] -= height + padding * 2;
    }

    if (showCollisions) {
      // КОРРЕКТИРОВКА КОЛЛИЗИЙ: радиус должен соответствовать новому масштабу (s ~ 0.55)
      const radius = 0.15;
      const radiusSq4 = radius * radius * 4;
      for (let i = 0; i < count; i++) {
        const e1 = ents[i];
        for (let j = i + 1; j < count; j++) {
          const e2 = ents[j];
          const dx = Position.x[e1] - Position.x[e2];
          const dy = Position.y[e1] - Position.y[e2];
          const distSq = dx * dx + dy * dy;
          if (distSq < radiusSq4) {
            const tempX = Velocity.x[e1];
            const tempY = Velocity.y[e1];
            Velocity.x[e1] = Velocity.x[e2];
            Velocity.y[e1] = Velocity.y[e2];
            Velocity.x[e2] = tempX;
            Velocity.y[e2] = tempY;
          }
        }
      }
    }

    if (meshRef.current) {
      meshRef.current.count = count;
      for (let i = 0; i < count; i++) {
        const eid = ents[i];
        // УВЕЛИЧЕННЫЙ МАСШТАБ: Соответствует Pixi (там 1.0, здесь ~0.55 для Three юнитов)
        const s = Scale.s[eid] * 0.55;
        dummy.position.set(Position.x[eid], Position.y[eid], 0);
        dummy.rotation.z = Rotation.angle[eid];
        dummy.scale.set(s, s, 1);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <mesh
        visible={false}
        scale={[viewport.width, viewport.height, 1]}
        onPointerDown={(e) => {
          const { x, y } = e.point;
          for (let i = 0; i < spawnCount; i++) {
            spawnLeaf(x, y);
          }
          setLeafCount(leafCount + spawnCount);
        }}
      >
        <planeGeometry />
      </mesh>
      <instancedMesh ref={meshRef} args={[undefined, undefined, 100000]}>
        <planeGeometry />
        <primitive object={material} />
      </instancedMesh>
    </>
  );
};

export const ForestCanvas: React.FC = () => {
  return (
    <div className="forest-canvas">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={async (props) => {
          const renderer = new WebGPURenderer(props as any);
          await renderer.init();
          renderer.outputColorSpace = THREE.SRGBColorSpace;
          return renderer;
        }}
      >
        <Background />
        <ForestLeaves />
      </Canvas>
      <style>{`
        .forest-canvas {
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          position: relative;
        }
      `}</style>
    </div>
  );
};
