import React, { useContext, useState } from 'react';
import { DockviewApiContext } from './App';
import { Button } from './components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';

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
      className="p-2.5 text-white h-full overflow-hidden flex flex-row"
      onMouseMove={handleResize}
      onMouseUp={stopResize}
      onMouseLeave={stopResize}
    >
      {/* Left Side - Environments and Tasks */}
      <div className={`flex-shrink-0 overflow-y-auto pr-2.5 ${(selectedEnvironment || selectedTask) ? 'border-r border-gray-700' : ''}`} 
           style={{ width: `${panelWidths.left}px` }}>
        {/* Environments Accordion */}
        <div className="mb-5">
          <div
            onClick={() => toggleSection('environments')}
            className="p-2.5 px-3 bg-gray-900 rounded cursor-pointer border border-gray-700 flex justify-between items-center mb-1 hover:bg-gray-800 transition-colors"
          >
            <h3 className="m-0">Environments</h3>
            <span className="text-xs">
              {expandedSections.environments ? '▼' : '▶'}
            </span>
          </div>
          
          {expandedSections.environments && (
            <div className="pl-2">
              {environments.map((env) => (
                <div
                  key={env.id}
                  onClick={() => openEnvironmentPanel(env)}
                  className="p-2 px-3 my-1 bg-gray-800 rounded cursor-pointer border border-gray-700 hover:bg-gray-700 transition-colors"
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
            className="p-2.5 px-3 bg-gray-900 rounded cursor-pointer border border-gray-700 flex justify-between items-center mb-1 hover:bg-gray-800 transition-colors"
          >
            <h3 className="m-0">Tasks</h3>
            <span className="text-xs">
              {expandedSections.tasks ? '▼' : '▶'}
            </span>
          </div>
          
          {expandedSections.tasks && (
            <div className="pl-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => openTaskPanel(task)}
                  className="p-2 px-3 my-1 bg-gray-800 rounded cursor-pointer border border-gray-700 hover:bg-gray-700 transition-colors"
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
          className="w-1.25 bg-gray-700 cursor-col-resize relative flex-shrink-0 hover:bg-gray-600 transition-colors"
          onMouseDown={() => startResize('left')}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-5 bg-gray-500 rounded-sm" />
        </div>
      )}
      
      {/* Right Side - Environment Detail Panel */}
      {selectedEnvironment && (
        <div className={`${selectedEnvironmentTask ? 'flex-shrink-0' : 'flex-1'} pl-5 overflow-y-auto ${selectedEnvironmentTask ? 'border-r border-gray-700' : ''}`} 
             style={{ width: selectedEnvironmentTask ? `${panelWidths.middle}px` : 'auto' }}>
          <div className="flex justify-between items-center mb-3.75 pb-2.5 border-b border-gray-700">
            <h3 className="m-0">{selectedEnvironment.name}</h3>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                openEnvironmentInNewPanel(selectedEnvironment);
              }}
              className="cursor-pointer px-2.5 py-1.5 rounded text-xs flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              title="Open in new panel"
            >
              <span>⊞</span>
              <span>Open in Panel</span>
            </Button>
          </div>
          
          <div className="text-sm leading-relaxed">
            <p><strong>Type:</strong> Development Environment</p>
            <p><strong>Status:</strong> <span className="text-green-500">Active</span></p>
            <p><strong>URL:</strong> https://dev.example.com</p>
            <p><strong>Database:</strong> PostgreSQL</p>
            <p><strong>Services:</strong> API, Web, Database</p>
            
            <div className="mt-3.75">
              <h4 className="mb-2">Environment Tasks</h4>
              <div className="flex flex-col gap-1">
                <div className="p-2 px-3 bg-gray-800 rounded text-xs cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => {
                  const task = { id: 'env_setup', name: 'Environment Setup' };
                  openEnvironmentTaskPanel(task);
                }}>
                  Environment Setup
                </div>
                <div className="p-2 px-3 bg-gray-800 rounded text-xs cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => {
                  const task = { id: 'deploy_service', name: 'Deploy Services' };
                  openEnvironmentTaskPanel(task);
                }}>
                  Deploy Services
                </div>
                <div className="p-2 px-3 bg-gray-800 rounded text-xs cursor-pointer hover:bg-gray-700 transition-colors"
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
          className="w-1.25 bg-gray-700 cursor-col-resize relative flex-shrink-0 hover:bg-gray-600 transition-colors"
          onMouseDown={() => startResize('middle')}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-5 bg-gray-500 rounded-sm" />
        </div>
      )}
      
      {/* Third Panel - Environment Task Detail Panel */}
      {selectedEnvironmentTask && (
        <div className="flex-1 pl-5 overflow-y-auto">
          <div className="flex justify-between items-center mb-3.75 pb-2.5 border-b border-gray-700">
            <h3 className="m-0">{selectedEnvironmentTask.name}</h3>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                openTaskInNewPanel(selectedEnvironmentTask);
              }}
              className="cursor-pointer px-2.5 py-1.5 rounded text-xs flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              title="Open in new panel"
            >
              <span>⊞</span>
              <span>Open in Panel</span>
            </Button>
          </div>
          
          <div className="text-sm leading-relaxed">
            <p><strong>Status:</strong> <span className="text-orange-500">In Progress</span></p>
            <p><strong>Priority:</strong> High</p>
            <p><strong>Environment:</strong> {selectedEnvironment.name}</p>
            <p><strong>Created:</strong> 2024-01-15</p>
            <p><strong>Due Date:</strong> 2024-01-20</p>
            
            <div className="mt-3.75">
              <h4 className="mb-2">Description</h4>
              <p className="text-gray-400 text-xs">
                This task involves setting up the development environment with all necessary dependencies and configurations. 
                Ensure all services are properly configured and running.
              </p>
            </div>
            
            <div className="mt-3.75">
              <h4 className="mb-2">Actions</h4>
              <div className="flex flex-col gap-2">
                <Button className="p-2 px-3 bg-green-600 hover:bg-green-700 rounded text-xs cursor-pointer text-center">
                  Start Task
                </Button>
                <Button className="p-2 px-3 bg-blue-600 hover:bg-blue-700 rounded text-xs cursor-pointer text-center">
                  View Logs
                </Button>
                <Button className="p-2 px-3 bg-red-600 hover:bg-red-700 rounded text-xs cursor-pointer text-center">
                  Cancel Task
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Right Side - Task Detail Panel */}
      {selectedTask && !selectedEnvironmentTask && (
        <div className="flex-1 pl-5 overflow-y-auto">
          <div className="flex justify-between items-center mb-3.75 pb-2.5 border-b border-gray-700">
            <h3 className="m-0">{selectedTask.name}</h3>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                openTaskInNewPanel(selectedTask);
              }}
              className="cursor-pointer px-2.5 py-1.5 rounded text-xs flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              title="Open in new panel"
            >
              <span>⊞</span>
              <span>Open in Panel</span>
            </Button>
          </div>
          
          <div className="text-sm leading-relaxed">
            <p><strong>Status:</strong> <span className="text-orange-500">In Progress</span></p>
            <p><strong>Priority:</strong> High</p>
            <p><strong>Assigned to:</strong> John Doe</p>
            <p><strong>Created:</strong> 2024-01-15</p>
            <p><strong>Due Date:</strong> 2024-01-20</p>
            
            <div className="mt-3.75">
              <h4 className="mb-2">Description</h4>
              <p className="text-gray-400 text-xs">
                This task involves setting up the development environment with all necessary dependencies and configurations. 
                Ensure all services are properly configured and running.
              </p>
            </div>
            
            <div className="mt-3.75">
              <h4 className="mb-2">Actions</h4>
              <div className="flex flex-col gap-2">
                <Button className="p-2 px-3 bg-green-600 hover:bg-green-700 rounded text-xs cursor-pointer text-center">
                  Start Task
                </Button>
                <Button className="p-2 px-3 bg-blue-600 hover:bg-blue-700 rounded text-xs cursor-pointer text-center">
                  View Logs
                </Button>
                <Button className="p-2 px-3 bg-red-600 hover:bg-red-700 rounded text-xs cursor-pointer text-center">
                  Cancel Task
                </Button>
              </div>
            </div>
            
            <div className="mt-3.75">
              <h4 className="mb-2">Related Environments</h4>
              <div className="flex flex-col gap-1">
                <div className="p-2 px-3 bg-gray-800 rounded text-xs cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => {
                  const env = { id: 'env1', name: 'Development Environment' };
                  openEnvironmentPanel(env);
                }}>
                  Development Environment
                </div>
                <div className="p-2 px-3 bg-gray-800 rounded text-xs cursor-pointer hover:bg-gray-700 transition-colors"
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
