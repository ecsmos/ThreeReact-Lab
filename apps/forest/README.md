# 🌲 ThreeReact-Lab: Forest Simulation

A high-performance interactive forest simulation built with **Three.js (WebGPU)**, **React Three Fiber**, and **BitECS**.

## 🚀 Key Features

- **Three.js WebGPU**: Utilizes the latest WebGPU rendering capabilities of Three.js.
- **BitECS Engine**: Uses a data-oriented Entity-Component-System (ECS) for efficient management of thousands of entities.
- **Custom TSL Shaders**:
  - **Forest Canopy**: A procedural forest background with sunlight shafts and swaying moss effects built using Three.js Shading Language (TSL).
  - **Mouse Interaction**: Sunlight follows the mouse, illuminating the canopy.
  - **Leaf Effects**: Leaf/flower textures are mixed with procedural sunlight and swaying animations.
- **Real-time Control**: A React + Zustand control panel to tweak:
  - Wind speed
  - Spawn rates
  - Sunlight intensity
  - Leaf collisions

## ⚙️ Performance Highlights

- **Typed Arrays**: BitECS stores all data in `Float32Array` buffers to ensure cache locality and zero GC pressure.
- **WebGPU Pipeline**: Custom shaders are built with TSL, optimized for modern GPU hardware via Three.js WebGPURenderer.
- **Optimized Rendering**: Leverages `InstancedMesh` for efficient rendering of thousands of foliage elements.

## 🏃 Running the Demo

```bash
# From the root directory
bun dev --filter forest
```
