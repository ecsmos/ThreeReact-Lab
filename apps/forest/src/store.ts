import { create } from 'zustand';

interface SimulationState {
  leafSpeed: number;
  spawnCount: number;
  leafCount: number;
  shaderIntensity: number;
  showCollisions: boolean;
  setLeafSpeed: (speed: number) => void;
  setSpawnCount: (count: number) => void;
  setLeafCount: (count: number) => void;
  setShaderIntensity: (intensity: number) => void;
  setShowCollisions: (show: boolean) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  leafSpeed: 1.5,
  spawnCount: 10,
  leafCount: 0,
  shaderIntensity: 0.5,
  showCollisions: false,
  setLeafSpeed: (leafSpeed) => set({ leafSpeed }),
  setSpawnCount: (spawnCount) => set({ spawnCount }),
  setLeafCount: (leafCount) => set({ leafCount }),
  setShaderIntensity: (shaderIntensity) => set({ shaderIntensity }),
  setShowCollisions: (showCollisions) => set({ showCollisions }),
}));
