import type React from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ThreeCanvas } from './components/ThreeCanvas';

const App: React.FC = () => {
  return (
    <div id="Root">
      <ThreeCanvas />
      <ControlPanel />
      <style>{`
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          background-color: #000;
        }
        #Root {
          width: 100vw;
          height: 100vh;
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default App;
