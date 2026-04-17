# 🧪 ThreeReact-Lab

A high-performance experiment laboratory showcasing **Three.js**, **WebGPU**, and **BitECS** integrated with **React**.

This repository is a direct counterpart to [PixiVue-Lab](https://github.com/ecsmos/PixiVue-Lab), implementing the same simulations and visual effects using the React ecosystem.

## 🚀 Projects

### [🐇 Bunnymark](./apps/bunnies)
A stress test rendering thousands of interactive bunnies in a deep space environment. 
- **Tech**: React, Three.js (WebGPU), BitECS, TSL Shaders.

### [🌲 Forest Simulation](./apps/forest)
A tranquil forest environment with sunlight shafts and swaying foliage.
- **Tech**: React, Three.js (WebGPU), BitECS, TSL Shaders.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Rendering**: [Three.js (WebGPURenderer)](https://threejs.org/) & [React Three Fiber](https://r3f.docs.pmnd.rs/)
- **ECS**: [BitECS](https://github.com/NateTheGreatt/bitECS)
- **State**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Build Tool**: [Vite](https://vitejs.dev/) & [Turborepo](https://turbo.build/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 🏃 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed.
- A browser with **WebGPU** support (e.g., Chrome, Edge, or Firefox Nightly).

### Installation

```bash
bun install
```

### Development

```bash
# Run all apps
bun dev

# Run specific app
bun dev --filter bunnies
bun dev --filter forest
```

### Build

```bash
bun build
```

## 📜 License

MIT
