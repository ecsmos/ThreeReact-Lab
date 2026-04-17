import type React from 'react';
import { useSimulationStore } from '../store';

export const ControlPanel: React.FC = () => {
  const store = useSimulationStore();

  return (
    <div className="control-panel">
      <h3>Bunnies-Lab Settings</h3>
      <div className="field">
        <label htmlFor="speed-range">
          Wind Speed: {store.bunnySpeed.toFixed(1)}
        </label>
        <input
          id="speed-range"
          type="range"
          value={store.bunnySpeed}
          onChange={(e) =>
            store.setBunnySpeed(Number.parseFloat(e.target.value))
          }
          min="0"
          max="10"
          step="0.1"
        />
      </div>
      <div className="field">
        <label htmlFor="spawn-range">Spawn Count: {store.spawnCount}</label>
        <input
          id="spawn-range"
          type="range"
          value={store.spawnCount}
          onChange={(e) => store.setSpawnCount(Number.parseInt(e.target.value))}
          min="1"
          max="100"
          step="1"
        />
      </div>
      <div className="field">
        <label htmlFor="intensity-range">
          Sunlight Intensity: {store.shaderIntensity.toFixed(2)}
        </label>
        <input
          id="intensity-range"
          type="range"
          value={store.shaderIntensity}
          onChange={(e) =>
            store.setShaderIntensity(Number.parseFloat(e.target.value))
          }
          min="0"
          max="1"
          step="0.01"
        />
      </div>
      <div className="field">
        <span className="label-text">Bunnies: {store.bunnyCount}</span>
      </div>
      <div className="field">
        <label>
          <input
            type="checkbox"
            checked={store.showCollisions}
            onChange={(e) => store.setShowCollisions(e.target.checked)}
          />
          Enable Collisions
        </label>
      </div>

      <style>{`
        .control-panel {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 15px;
          border-radius: 8px;
          font-family: sans-serif;
          backdrop-filter: blur(5px);
          width: 220px;
          z-index: 100;
        }
        h3 { margin-top: 0; font-size: 16px; border-bottom: 1px solid #444; padding-bottom: 8px; }
        .field { margin: 12px 0; }
        label { display: block; margin-bottom: 4px; font-size: 13px; }
        input[type="range"] { width: 100%; }
      `}</style>
    </div>
  );
};
