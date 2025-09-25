import React, { useContext, useState } from 'react';
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

  const [expandedSections, setExpandedSections] = useState({
    environments: true,
    tasks: true
  });

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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
      {/* Environments Accordion */}
      <div style={{ marginBottom: '20px' }}>
        <div
          onClick={() => toggleSection('environments')}
          style={{
            padding: '10px 12px',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            cursor: 'pointer',
            border: '1px solid #444',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#2a2a2a'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
        >
          <h3 style={{ margin: 0 }}>Environments</h3>
          <span style={{ fontSize: '12px' }}>
            {expandedSections.environments ? '▼' : '▶'}
          </span>
        </div>
        
        {expandedSections.environments && (
          <div style={{ paddingLeft: '8px' }}>
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
        )}
      </div>
      
      {/* Tasks Accordion */}
      <div>
        <div
          onClick={() => toggleSection('tasks')}
          style={{
            padding: '10px 12px',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            cursor: 'pointer',
            border: '1px solid #444',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#2a2a2a'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
        >
          <h3 style={{ margin: 0 }}>Tasks</h3>
          <span style={{ fontSize: '12px' }}>
            {expandedSections.tasks ? '▼' : '▶'}
          </span>
        </div>
        
        {expandedSections.tasks && (
          <div style={{ paddingLeft: '8px' }}>
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
        )}
      </div>
    </div>
  );
};

export default LeftPanel;
