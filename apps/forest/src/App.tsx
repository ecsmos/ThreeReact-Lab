import type React from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ForestCanvas } from './components/ForestCanvas';

const App: React.FC = () => {
  return (
    <div id="Root">
      <ForestCanvas />
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
