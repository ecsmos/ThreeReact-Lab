# 🐇 ThreeReact-Lab: Bunnymark

A high-performance interactive stress test built with **Three.js (WebGPU)**, **React Three Fiber**, and **BitECS**.

## 🚀 Key Features

- **Three.js WebGPU**: Utilizes the latest WebGPU rendering capabilities of Three.js.
- **BitECS Engine**: Uses a data-oriented Entity-Component-System (ECS) for efficient management of thousands of entities.
- **Custom TSL Shaders**:
  - **Dynamic Background**: A procedural "deep space" background with parallax stars and nebula effects built using Three.js Shading Language (TSL).
  - **Mouse Interaction**: Real-time shader influence based on mouse position (distance-based lighting and glows).
  - **Instanced Rendering**: High-performance rendering of thousands of bunnies using `InstancedMesh`.
- **Real-time Control**: A React + Zustand control panel to tweak:
  - Simulation speed
  - Spawn rates
  - Shader intensity
  - Collision detection

## ⚙️ Performance Highlights

- **Typed Arrays**: BitECS stores all data in `Float32Array` buffers to ensure cache locality and zero GC pressure during the simulation loop.
- **WebGPU Pipeline**: Custom shaders are built with TSL, taking full advantage of the modern GPU hardware via Three.js WebGPURenderer.
- **Optimized Rendering**: Leverages `InstancedMesh` to render all bunnies in a single draw call.

## 🛠️ Architecture

The application follows a clean separation of concerns:
- **React components** handle the UI and reactive store updates.
- **BitECS systems** handle the heavy lifting: movement, collision, and mapping ECS data to `InstancedMesh` matrices.
- **React Three Fiber (useFrame)** drives the high-frequency update loop.

## 🏃 Running the Demo

```bash
# From the root directory
bun dev --filter bunnies
```
