import React, { useContext } from 'react';
import { DockviewApiContext } from './App';

const EnvironmentPanel = (props) => {
  const { params, api } = props;
  const { environment } = params || {};
  const dockviewApi = useContext(DockviewApiContext);
  
  console.log('EnvironmentPanel props:', props);
  console.log('context dockviewApi:', dockviewApi);
  console.log('panel api keys:', Object.keys(api || {}));
  console.log('panel group:', api?.group);
  console.log('panel group keys:', Object.keys(api?.group || {}));

  const environmentTasks = [
    { id: 'env_task_1', name: 'Initialize Environment' },
    { id: 'env_task_2', name: 'Configure Services' },
    { id: 'env_task_3', name: 'Run Tests' },
    { id: 'env_task_4', name: 'Deploy Changes' },
  ];

  const openTaskPanel = (task) => {
    console.log('EnvironmentPanel openTaskPanel called:', task);
    console.log('dockviewApi available:', !!dockviewApi);
    
    if (dockviewApi) {
      const panelId = `env_task_panel_${task.id}`;
      console.log('Attempting to add panel:', panelId);
      
      try {
        dockviewApi.addPanel({
          id: panelId,
          component: 'TaskPanel',
          title: task.name,
          params: { task: task, environment: environment },
          position: { referencePanel: props.api.id, direction: 'right' },
        });
        console.log('Panel added successfully');
      } catch (error) {
        console.error('Error adding panel:', error);
      }
    } else {
      console.error('dockviewApi is not available');
    }
  };

  return (
    <div style={{ padding: '10px', color: 'white', height: '100%', overflowY: 'auto' }}>
      <h4 style={{ marginBottom: '15px' }}>
        {environment ? `${environment.name} - Tasks` : 'Environment Tasks'}
      </h4>
      <div>
        {environmentTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => openTaskPanel(task)}
            style={{
              padding: '10px 15px',
              margin: '6px 0',
              backgroundColor: '#2a2a2a',
              borderRadius: '4px',
              cursor: 'pointer',
              border: '1px solid #444',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#3a3a3a'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#2a2a2a'}
          >
            <div style={{ fontWeight: 'bold' }}>{task.name}</div>
            <div style={{ fontSize: '12px', color: '#ccc', marginTop: '4px' }}>
              Click to open task details
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnvironmentPanel;
