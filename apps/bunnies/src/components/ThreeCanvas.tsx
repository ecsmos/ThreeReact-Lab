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

    const t = timeNode.mul(0.3); // Ускоряем время до соответствия Pixi (0.05 * 6 * 1)
    const st = uvNode.mul(2.0).sub(1.0);
    const aspect = resolutionNode.x.div(resolutionNode.y);
    const p = st.mul(TSL.vec2(aspect, 1.0));
    const m = mouseNode.mul(2.0).sub(1.0).mul(TSL.vec2(aspect, 1.0));

    const distToMouse = p.sub(m).length();
    const mouseInfluence = TSL.smoothstep(0.5, 0.0, distToMouse);

    // Deep space background color (максимально темный для контраста)
    let colorNode = TSL.mix(
      TSL.vec3(0.005, 0.0, 0.02),
      TSL.vec3(0.01, 0.0, 0.08),
      mouseInfluence,
    );

    // Hash function for stars
    const hash = (p: any) =>
      TSL.fract(TSL.sin(TSL.dot(p, TSL.vec2(12.9898, 78.233))).mul(43758.5453));

    // Add 3 layers of stars (manually unrolled loop)
    [1.0, 2.0, 3.0].forEach((i) => {
      const parallax = m.mul(0.05 * i);
      const uvLayer = p
        .mul(1.5 + i * 0.5)
        .add(TSL.vec2(TSL.cos(t.mul(0.1 * i)), TSL.sin(t.mul(0.15 * i))))
        .sub(parallax);

      const grid = uvLayer.mul(15.0).floor();
      const f = uvLayer.mul(15.0).fract().sub(0.5);

      const h = hash(grid.add(i * 123.456));
      const isStar = h.greaterThan(0.985);

      const dist = f.length();
      const sparkle = TSL.sin(timeNode.mul(5.0).add(h.mul(10.0)))
        .mul(0.5)
        .add(0.5);

      const starBrightness = TSL.float(0.003)
        .div(dist)
        .mul(sparkle)
        .mul(mouseInfluence.mul(2.0).add(1.0));

      const starColor = TSL.vec3(0.8, 0.9, 1.0).mul(starBrightness);

      colorNode = TSL.select(isStar, colorNode.add(starColor), colorNode);
    });

    // Nebula clouds
    const nebulaPosNode = p
      .mul(0.8)
      .add(TSL.vec2(TSL.sin(t.mul(0.2)), TSL.cos(t.mul(0.15))))
      .sub(m.mul(0.1));

    const n1 = TSL.sin(nebulaPosNode.x.mul(2.0).add(t)).mul(
      TSL.sin(nebulaPosNode.y.mul(3.0).sub(t)),
    );
    const n2 = TSL.sin(nebulaPosNode.y.mul(2.5).add(t.mul(0.8))).mul(
      TSL.sin(nebulaPosNode.x.mul(1.5).sub(t.mul(0.5))),
    );

    const nebulaBase = n1.add(n2).add(1.0).mul(0.5);

    colorNode = colorNode.add(
      TSL.vec3(0.08, 0.04, 0.15) // Уменьшена яркость туманности для контраста
        .mul(nebulaBase)
        .mul(mouseInfluence.add(1.0)),
    );

    // Subtle glow around the mouse
    colorNode = colorNode.add(
      TSL.vec3(0.1, 0.2, 0.4).mul(TSL.exp(distToMouse.mul(-4.0))),
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

const Bunnies = () => {
  const { viewport } = useThree();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const intensityUniformRef = useRef(TSL.uniform(0.5));

  // Используем селекторы для оптимизации производительности
  const bunnySpeed = useSimulationStore((s) => s.bunnySpeed);
  const spawnCount = useSimulationStore((s) => s.spawnCount);
  const bunnyCount = useSimulationStore((s) => s.bunnyCount);
  const shaderIntensity = useSimulationStore((s) => s.shaderIntensity);
  const showCollisions = useSimulationStore((s) => s.showCollisions);
  const setBunnyCount = useSimulationStore((s) => s.setBunnyCount);

  const material = useMemo(() => {
    const mat = new MeshBasicNodeMaterial();
    mat.transparent = true;

    new THREE.TextureLoader().load(
      'https://pixijs.com/assets/bunny.png',
      (tex) => {
        // КОРРЕКТИРОВКА ЦВЕТА ТЕКСТУРЫ: Устанавливаем SRGB для правильного отображения
        tex.colorSpace = THREE.SRGBColorSpace;

        const texNode = TSL.texture(tex);
        const time = TSL.time.mul(1.5);

        // КРИТИЧЕСКОЕ: Индивидуальное смещение для каждого кролика (мигание "сами по себе")
        const instanceId = TSL.instanceIndex;
        // Используем ручной хеш, приводя instanceId к float для совместимости с TSL.sin()
        const randomOffset = TSL.fract(
          TSL.sin(TSL.float(instanceId).mul(12.9898)).mul(43758.5453),
        ).mul(10.0);
        const timeInstance = time.add(randomOffset);

        const uv = TSL.uv().mul(2.0).sub(1.0);

        // Делаем пульсацию ОЧЕНЬ выраженной (от 0.2 до 1.5) для заметности мигания
        const pulse = TSL.sin(timeInstance.mul(3.0)).mul(0.65).add(0.85);
        const nebulaColor = TSL.vec3(0.1, 0.4, 1.0).mul(pulse);

        const sparkle = TSL.sin(uv.x.mul(10.0).add(timeInstance.mul(5.0))).mul(
          TSL.cos(uv.y.mul(10.0).sub(timeInstance.mul(3.0))),
        );
        const stars = TSL.smoothstep(0.7, 1.0, sparkle).mul(
          TSL.vec3(1.0, 1.0, 1.0),
        );
        const finalEffect = TSL.mix(nebulaColor, nebulaColor.add(stars), 0.5);

        mat.colorNode = TSL.vec4(
          TSL.mix(
            texNode.rgb,
            finalEffect.mul(texNode.rgb).mul(2.5), // Увеличиваем яркость эффекта
            intensityUniformRef.current,
          ),
          texNode.a,
        );
        mat.needsUpdate = true;
      },
    );
    return mat;
  }, []);

  const spawnBunny = useCallback((x: number, y: number) => {
    const eid = addEntity(world);
    addComponent(world, eid, Position);
    addComponent(world, eid, Velocity);
    addComponent(world, eid, Rotation);
    addComponent(world, eid, Scale);

    Position.x[eid] = x;
    Position.y[eid] = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + 1;
    Velocity.x[eid] = Math.cos(angle) * speed;
    Velocity.y[eid] = Math.sin(angle) * speed;
    Rotation.angle[eid] = 0;
    Rotation.angularVelocity[eid] = (Math.random() - 0.5) * 0.1;
    Scale.s[eid] = 0.5 + Math.random() * 0.5;
  }, []);

  useEffect(() => {
    const count = 50;
    for (let i = 0; i < count; i++) {
      spawnBunny(
        (Math.random() - 0.5) * viewport.width,
        (Math.random() - 0.5) * viewport.height,
      );
    }
    setBunnyCount(count);
  }, [setBunnyCount, spawnBunny, viewport]);

  useFrame((state, delta) => {
    const dt = delta * 60;
    intensityUniformRef.current.value = shaderIntensity;

    // ECS Systems
    const ents = query(world, [Position, Velocity, Rotation]);
    const count = ents.length;

    // Используем viewport из state для максимальной точности при resize
    const { width, height } = state.viewport;
    const halfW = width / 2;
    const halfH = height / 2;
    // КОРРЕКТИРОВКА СКОРОСТИ: Pixi использует пиксели, Three - юниты.
    // Уменьшаем множитель, чтобы замедлить движение до уровня Pixi.
    const velMultiplier = bunnySpeed * dt * 0.008;

    for (let i = 0; i < count; i++) {
      const eid = ents[i];
      Position.x[eid] += Velocity.x[eid] * velMultiplier;
      Position.y[eid] += Velocity.y[eid] * velMultiplier;
      Rotation.angle[eid] += Rotation.angularVelocity[eid] * dt;

      // Улучшенная логика wrap-around: сохраняем дистанцию выхода за границу
      if (Position.x[eid] < -halfW) Position.x[eid] += width;
      else if (Position.x[eid] > halfW) Position.x[eid] -= width;

      if (Position.y[eid] < -halfH) Position.y[eid] += height;
      else if (Position.y[eid] > halfH) Position.y[eid] -= height;
    }

    if (showCollisions) {
      // КОРРЕКТИРОВКА КОЛЛИЗИЙ: радиус должен соответствовать новому масштабу (s = scale * 0.18)
      const radius = 0.08;
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
      // КРИТИЧЕСКОЕ: Отрисовываем только реально существующее количество кроликов
      meshRef.current.count = count;

      for (let i = 0; i < count; i++) {
        const eid = ents[i];
        // КОРРЕКТИРОВКА РАЗМЕРА: Увеличиваем масштаб кроликов, чтобы соответствовать Pixi
        const s = Scale.s[eid] * 0.18;
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
            spawnBunny(x, y);
          }
          setBunnyCount(bunnyCount + spawnCount);
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

export const ThreeCanvas: React.FC = () => {
  return (
    <div className="three-canvas">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={async (props) => {
          const renderer = new WebGPURenderer(props as any);
          await renderer.init();
          // КОРРЕКТИРОВКА ЦВЕТА: Устанавливаем SRGB для контрастных цветов как в Pixi
          renderer.outputColorSpace = THREE.SRGBColorSpace;
          return renderer;
        }}
      >
        <Background />
        <Bunnies />
      </Canvas>
      <style>{`
        .three-canvas {
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          position: relative;
        }
      `}</style>
    </div>
  );
};
