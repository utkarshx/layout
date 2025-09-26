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

  const [selectedEnvironment, setSelectedEnvironment] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedEnvironmentTask, setSelectedEnvironmentTask] = useState(null);
  
  // Panel widths and resize state
  const [panelWidths, setPanelWidths] = useState({
    left: 300,
    middle: 400,
  });
  const [isResizing, setIsResizing] = useState(null); // 'left' or 'middle'

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
    // Instead of opening a new panel, we'll set the selected environment
    setSelectedEnvironment(env);
    setSelectedTask(null); // Clear task selection when environment is selected
  };

  const openEnvironmentInNewPanel = (env) => {
    console.log('openEnvironmentInNewPanel called:', env);
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
    // Instead of opening a new panel, we'll set the selected task
    setSelectedTask(task);
    setSelectedEnvironment(null); // Clear environment selection when task is selected
    setSelectedEnvironmentTask(null); // Clear environment task selection
  };

  const openEnvironmentTaskPanel = (task) => {
    console.log('openEnvironmentTaskPanel called:', task);
    // Set the environment task without clearing the environment
    setSelectedEnvironmentTask(task);
    setSelectedTask(null); // Clear main task selection
  };

  // Resize handlers
  const startResize = (divider) => {
    setIsResizing(divider);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const stopResize = () => {
    setIsResizing(null);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  const handleResize = (e) => {
    if (!isResizing) return;
    
    const container = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - container.left;
    
    if (isResizing === 'left') {
      // Resize left panel
      const newLeftWidth = Math.max(200, Math.min(mouseX, 500));
      setPanelWidths(prev => ({ ...prev, left: newLeftWidth }));
    } else if (isResizing === 'middle') {
      // Resize middle panel
      const leftPanelEnd = panelWidths.left + 5; // 5px for divider
      const newMiddleWidth = Math.max(300, Math.min(mouseX - leftPanelEnd, 600));
      setPanelWidths(prev => ({ ...prev, middle: newMiddleWidth }));
    }
  };

  const openTaskInNewPanel = (task) => {
    console.log('openTaskInNewPanel called:', task);
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
    <div 
      style={{ padding: '10px', color: 'white', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'row' }}
      onMouseMove={handleResize}
      onMouseUp={stopResize}
      onMouseLeave={stopResize}
    >
      {/* Left Side - Environments and Tasks */}
      <div style={{ 
        flex: `0 0 ${panelWidths.left}px`, 
        overflowY: 'auto', 
        paddingRight: '10px',
        borderRight: (selectedEnvironment || selectedTask) ? '1px solid #444' : 'none'
      }}>
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
      
      {/* First Resize Divider - Between List and Environment */}
      {(selectedEnvironment || selectedTask) && (
        <div
          style={{
            width: '5px',
            backgroundColor: '#444',
            cursor: 'col-resize',
            position: 'relative',
            flexShrink: 0
          }}
          onMouseDown={() => startResize('left')}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#666'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#444'}
        >
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '2px',
            height: '20px',
            backgroundColor: '#888',
            borderRadius: '1px'
          }} />
        </div>
      )}
      
      {/* Right Side - Environment Detail Panel */}
      {selectedEnvironment && (
        <div style={{ 
          flex: selectedEnvironmentTask ? `0 0 ${panelWidths.middle}px` : 1, 
          paddingLeft: '20px',
          overflowY: 'auto',
          borderRight: selectedEnvironmentTask ? '1px solid #444' : 'none'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '15px',
            paddingBottom: '10px',
            borderBottom: '1px solid #444'
          }}>
            <h3 style={{ margin: 0 }}>{selectedEnvironment.name}</h3>
            <div
              onClick={(e) => {
                e.stopPropagation();
                openEnvironmentInNewPanel(selectedEnvironment);
              }}
              style={{
                cursor: 'pointer',
                padding: '6px 10px',
                borderRadius: '4px',
                backgroundColor: '#007acc',
                color: 'white',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#005a9e'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#007acc'}
              title="Open in new panel"
            >
              <span>⊞</span>
              <span>Open in Panel</span>
            </div>
          </div>
          
          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
            <p><strong>Type:</strong> Development Environment</p>
            <p><strong>Status:</strong> <span style={{ color: '#4CAF50' }}>Active</span></p>
            <p><strong>URL:</strong> https://dev.example.com</p>
            <p><strong>Database:</strong> PostgreSQL</p>
            <p><strong>Services:</strong> API, Web, Database</p>
            
            <div style={{ marginTop: '15px' }}>
              <h4 style={{ marginBottom: '8px' }}>Environment Tasks</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#2a2a2a', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#3a3a3a'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2a2a2a'}
                onClick={() => {
                  const task = { id: 'env_setup', name: 'Environment Setup' };
                  openEnvironmentTaskPanel(task);
                }}>
                  Environment Setup
                </div>
                <div style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#2a2a2a', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#3a3a3a'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2a2a2a'}
                onClick={() => {
                  const task = { id: 'deploy_service', name: 'Deploy Services' };
                  openEnvironmentTaskPanel(task);
                }}>
                  Deploy Services
                </div>
                <div style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#2a2a2a', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#3a3a3a'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2a2a2a'}
                onClick={() => {
                  const task = { id: 'run_tests', name: 'Run Tests' };
                  openEnvironmentTaskPanel(task);
                }}>
                  Run Tests
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Second Resize Divider */}
      {selectedEnvironmentTask && (
        <div
          style={{
            width: '5px',
            backgroundColor: '#444',
            cursor: 'col-resize',
            position: 'relative',
            flexShrink: 0
          }}
          onMouseDown={() => startResize('middle')}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#666'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#444'}
        >
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '2px',
            height: '20px',
            backgroundColor: '#888',
            borderRadius: '1px'
          }} />
        </div>
      )}
      
      {/* Third Panel - Environment Task Detail Panel */}
      {selectedEnvironmentTask && (
        <div style={{ 
          flex: 1, 
          paddingLeft: '20px',
          overflowY: 'auto'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '15px',
            paddingBottom: '10px',
            borderBottom: '1px solid #444'
          }}>
            <h3 style={{ margin: 0 }}>{selectedEnvironmentTask.name}</h3>
            <div
              onClick={(e) => {
                e.stopPropagation();
                openTaskInNewPanel(selectedEnvironmentTask);
              }}
              style={{
                cursor: 'pointer',
                padding: '6px 10px',
                borderRadius: '4px',
                backgroundColor: '#007acc',
                color: 'white',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#005a9e'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#007acc'}
              title="Open in new panel"
            >
              <span>⊞</span>
              <span>Open in Panel</span>
            </div>
          </div>
          
          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
            <p><strong>Status:</strong> <span style={{ color: '#FF9800' }}>In Progress</span></p>
            <p><strong>Priority:</strong> High</p>
            <p><strong>Environment:</strong> {selectedEnvironment.name}</p>
            <p><strong>Created:</strong> 2024-01-15</p>
            <p><strong>Due Date:</strong> 2024-01-20</p>
            
            <div style={{ marginTop: '15px' }}>
              <h4 style={{ marginBottom: '8px' }}>Description</h4>
              <p style={{ color: '#ccc', fontSize: '13px' }}>
                This task involves setting up the development environment with all necessary dependencies and configurations. 
                Ensure all services are properly configured and running.
              </p>
            </div>
            
            <div style={{ marginTop: '15px' }}>
              <h4 style={{ marginBottom: '8px' }}>Actions</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#4CAF50', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}>
                  Start Task
                </div>
                <div style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#2196F3', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1976D2'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2196F3'}>
                  View Logs
                </div>
                <div style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#f44336', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#d32f2f'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f44336'}>
                  Cancel Task
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Right Side - Task Detail Panel */}
      {selectedTask && !selectedEnvironmentTask && (
        <div style={{ 
          flex: 1, 
          paddingLeft: '20px',
          overflowY: 'auto'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '15px',
            paddingBottom: '10px',
            borderBottom: '1px solid #444'
          }}>
            <h3 style={{ margin: 0 }}>{selectedTask.name}</h3>
            <div
              onClick={(e) => {
                e.stopPropagation();
                openTaskInNewPanel(selectedTask);
              }}
              style={{
                cursor: 'pointer',
                padding: '6px 10px',
                borderRadius: '4px',
                backgroundColor: '#007acc',
                color: 'white',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#005a9e'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#007acc'}
              title="Open in new panel"
            >
              <span>⊞</span>
              <span>Open in Panel</span>
            </div>
          </div>
          
          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
            <p><strong>Status:</strong> <span style={{ color: '#FF9800' }}>In Progress</span></p>
            <p><strong>Priority:</strong> High</p>
            <p><strong>Assigned to:</strong> John Doe</p>
            <p><strong>Created:</strong> 2024-01-15</p>
            <p><strong>Due Date:</strong> 2024-01-20</p>
            
            <div style={{ marginTop: '15px' }}>
              <h4 style={{ marginBottom: '8px' }}>Description</h4>
              <p style={{ color: '#ccc', fontSize: '13px' }}>
                This task involves setting up the development environment with all necessary dependencies and configurations. 
                Ensure all services are properly configured and running.
              </p>
            </div>
            
            <div style={{ marginTop: '15px' }}>
              <h4 style={{ marginBottom: '8px' }}>Actions</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#4CAF50', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}>
                  Start Task
                </div>
                <div style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#2196F3', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1976D2'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2196F3'}>
                  View Logs
                </div>
                <div style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#f44336', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#d32f2f'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f44336'}>
                  Cancel Task
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '15px' }}>
              <h4 style={{ marginBottom: '8px' }}>Related Environments</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#2a2a2a', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#3a3a3a'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2a2a2a'}
                onClick={() => {
                  const env = { id: 'env1', name: 'Development Environment' };
                  openEnvironmentPanel(env);
                }}>
                  Development Environment
                </div>
                <div style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#2a2a2a', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#3a3a3a'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2a2a2a'}
                onClick={() => {
                  const env = { id: 'env2', name: 'Staging Environment' };
                  openEnvironmentPanel(env);
                }}>
                  Staging Environment
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeftPanel;
