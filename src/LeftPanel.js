import React, { useContext } from 'react';
import { DockviewApiContext } from './App';

const LeftPanel = (props) => {
  const { api } = props;
  const dockviewApi = useContext(DockviewApiContext);
  
  console.log('LeftPanel props:', props);
  console.log('panel api:', api);
  console.log('context dockviewApi:', dockviewApi);
  console.log('panel api keys:', Object.keys(api || {}));
  console.log('panel group:', api?.group);
  console.log('panel group keys:', Object.keys(api?.group || {}));

  const environments = [
    { id: 'env1', name: 'Development Environment' },
    { id: 'env2', name: 'Staging Environment' },
    { id: 'env3', name: 'Production Environment' },
  ];

  const tasks = [
    { id: 'task1', name: 'Setup Database' },
    { id: 'task2', name: 'Configure API' },
    { id: 'task3', name: 'Deploy Application' },
  ];

  const openEnvironmentPanel = (env) => {
    console.log('openEnvironmentPanel called:', env);
    console.log('dockviewApi available:', !!dockviewApi);
    
    if (dockviewApi) {
      const panelId = `environment_panel_${env.id}`;
      console.log('Attempting to add panel:', panelId);
      
      try {
        dockviewApi.addPanel({
          id: panelId,
          component: 'EnvironmentPanel',
          title: env.name,
          params: { environment: env },
          position: { referencePanel: 'left_panel', direction: 'right' },
        });
        console.log('Panel added successfully');
      } catch (error) {
        console.error('Error adding panel:', error);
      }
    } else {
      console.error('No dockview API available');
    }
  };

  const openTaskPanel = (task) => {
    console.log('openTaskPanel called:', task);
    console.log('dockviewApi available:', !!dockviewApi);
    
    if (dockviewApi) {
      const panelId = `task_panel_${task.id}`;
      console.log('Attempting to add panel:', panelId);
      
      try {
        dockviewApi.addPanel({
          id: panelId,
          component: 'TaskPanel',
          title: task.name,
          params: { task: task },
          position: { referencePanel: 'left_panel', direction: 'right' },
        });
        console.log('Panel added successfully');
      } catch (error) {
        console.error('Error adding panel:', error);
      }
    } else {
      console.error('No dockview API available');
    }
  };

  return (
    <div style={{ padding: '10px', color: 'white', height: '100%', overflowY: 'auto' }}>
      <h3 style={{ marginBottom: '10px' }}>Environments</h3>
      <div style={{ marginBottom: '20px' }}>
        {environments.map((env) => (
          <div
            key={env.id}
            onClick={() => openEnvironmentPanel(env)}
            style={{
              padding: '8px 12px',
              margin: '4px 0',
              backgroundColor: '#2a2a2a',
              borderRadius: '4px',
              cursor: 'pointer',
              border: '1px solid #444',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#3a3a3a'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#2a2a2a'}
          >
            {env.name}
          </div>
        ))}
      </div>
      
      <h3 style={{ marginBottom: '10px' }}>Tasks</h3>
      <div>
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => openTaskPanel(task)}
            style={{
              padding: '8px 12px',
              margin: '4px 0',
              backgroundColor: '#2a2a2a',
              borderRadius: '4px',
              cursor: 'pointer',
              border: '1px solid #444',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#3a3a3a'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#2a2a2a'}
          >
            {task.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftPanel;
