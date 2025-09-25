import React, { useState, useMemo, useRef, createContext } from 'react';
import { DockviewReact } from 'dockview-react';
import 'dockview-core/dist/styles/dockview.css';
import './App.css';
import LeftPanel from './LeftPanel';
import EnvironmentPanel from './EnvironmentPanel';
import TaskPanel from './TaskPanel';

export const DockviewApiContext = createContext(null);

const App = () => {
  const [dockviewApi, setDockviewApi] = useState(null);
  const dockviewApiRef = useRef(null);

  const components = useMemo(() => ({
    LeftPanel: (props) => <LeftPanel {...props} dockviewApi={dockviewApi} />,
    EnvironmentPanel: (props) => <EnvironmentPanel {...props} dockviewApi={dockviewApi} />,
    TaskPanel: (props) => <TaskPanel {...props} />,
  }), [dockviewApi]);

  const onReady = (event) => {
    const { api } = event;
    console.log('Dockview API ready:', api);
    setDockviewApi(api);
    dockviewApiRef.current = api;

    try {
      api.addPanel({
        id: 'left_panel',
        component: 'LeftPanel',
        title: 'Controls',
      });
      console.log('Left panel added successfully');
    } catch (error) {
      console.error('Error adding left panel:', error);
    }
  };

  return (
    <DockviewApiContext.Provider value={dockviewApi}>
      <div style={{ height: '100vh' }}>
        <DockviewReact
          components={components}
          onReady={onReady}
          className="dockview-theme-dark"
        />
      </div>
    </DockviewApiContext.Provider>
  );
};

export default App;