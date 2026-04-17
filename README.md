# ThreeReact-Lab ⚛️

[**Live Demo**](https://ecsmos.github.io/ThreeReact-Lab/)

A high-performance monorepo for exploring cutting-edge web technologies, specifically focused on **WebGPU**, **Three.js**, and **Entity-Component-System (ECS)** patterns within the **React** ecosystem.

## 🌟 Overview

ThreeReact-Lab is a "lab" project designed to test the limits of modern web graphics and state management. It demonstrates how to combine the declarative power of React and React Three Fiber with the raw performance of WebGPU and data-oriented ECS.

This project is a direct counterpart to [PixiVue-Lab](https://github.com/ecsmos/PixiVue-Lab), implementing the same simulations and visual effects using the React ecosystem.

## 🛠️ Tech Stack

- **Core Engine**: [Three.js](https://threejs.org/) — Leveraging the latest WebGPU (via WebGPURenderer) capabilities.
- **Rendering API**: **WebGPU** with custom **TSL** (Three Shading Language) shaders.
- **ECS**: [BitECS](https://github.com/NateTheGreatt/bitECS) — A lightning-fast, data-oriented ECS for handling thousands of entities.
- **Framework**: [React 19](https://react.dev/) & [React Three Fiber](https://r3f.docs.pmnd.rs/) — Reactive UI and declarative 3D scene management.
- **Monorepo**: [Turbo](https://turbo.build/) + [Bun](https://bun.sh/) — Fast builds and efficient dependency management.
- **Linter/Formatter**: [Biome](https://biomejs.dev/) — Next-generation toolchain for web projects.

## 📂 Project Structure

```bash
ThreeReact-Lab/
├── apps/
│   ├── bunnies/      # 🐰 Space-themed high-performance stress test
│   └── forest/       # 🌲 Forest-themed simulation with sunlight shaders
├── packages/         # Shared utilities and types
├── .github/          # CI/CD workflows for multi-project deployment
└── README.md         # This documentation
```

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.1.0 or higher)
- A browser with [WebGPU support](https://caniuse.com/webgpu) (Chrome 113+, Edge 113+)

### Installation

```bash
# Clone the repository
git clone https://github.com/ecsmos/ThreeReact-Lab.git
cd ThreeReact-Lab

# Install dependencies
bun install
```

### Running Locally

```bash
# Start all applications in development mode
bun dev

# Run specific application
bun dev --filter forest
```

## 🧪 Current Experiments

### 1. [Bunnies](https://ecsmos.github.io/ThreeReact-Lab/bunnies/) (apps/bunnies)
A modern take on the classic "Bunnymark" in deep space.
- **Theme**: Deep space, nebula, stars.
- **Shaders**: Procedural space background, pulsing nebula glow on entities using TSL.

### 2. [Forest](https://ecsmos.github.io/ThreeReact-Lab/forest/) (apps/forest)
An organic-themed simulation exploring sunlight and wind effects.
- **Theme**: Forest canopy, moss, sunlight shafts.
- **Shaders**: Sunlight beams (sun shafts), wind-driven swaying animations using TSL.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
