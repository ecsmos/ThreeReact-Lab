import { create } from 'zustand';

interface SimulationState {
  bunnySpeed: number;
  spawnCount: number;
  bunnyCount: number;
  shaderIntensity: number;
  showCollisions: boolean;
  setBunnySpeed: (speed: number) => void;
  setSpawnCount: (count: number) => void;
  setBunnyCount: (count: number) => void;
  setShaderIntensity: (intensity: number) => void;
  setShowCollisions: (show: boolean) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  bunnySpeed: 2,
  spawnCount: 10,
  bunnyCount: 0,
  shaderIntensity: 0.5,
  showCollisions: false,
  setBunnySpeed: (bunnySpeed) => set({ bunnySpeed }),
  setSpawnCount: (spawnCount) => set({ spawnCount }),
  setBunnyCount: (bunnyCount) => set({ bunnyCount }),
  setShaderIntensity: (shaderIntensity) => set({ shaderIntensity }),
  setShowCollisions: (showCollisions) => set({ showCollisions }),
}));
