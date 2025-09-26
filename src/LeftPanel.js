import React, { useState, useRef, useEffect, useContext } from 'react';
import { DockviewApiContext } from './App';
import { Button } from './components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Input } from './components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import EnvironmentPanel from './EnvironmentPanel';
import TaskPanel from './TaskPanel';

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

  // Popover state management
  const [openPopovers, setOpenPopovers] = useState({});
  
  // Selected task for split view in environment popover
  const [selectedTaskInEnv, setSelectedTaskInEnv] = useState({});

  const environments = [
    { id: 'env1', name: 'Local' },
    { id: 'env2', name: 'Docker' },
    { id: 'env3', name: 'E2B' },
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

  // Popover management functions
  const setPopoverOpen = (id, isOpen) => {
    setOpenPopovers(prev => ({
      ...prev,
      [id]: isOpen
    }));
  };

  // Split Environment Panel Component
  const SplitEnvironmentPanel = ({ environment, envId }) => {
    const [selectedTask, setSelectedTask] = useState(null);

    return (
      <div className="h-full flex">
        {/* Environment Panel - Left Side */}
        <div className={`${selectedTask ? 'w-1/2' : 'w-full'} border-r border-gray-700`}>
          <DockviewApiContext.Provider value={dockviewApi}>
            <EnvironmentPanel 
              params={{ environment: environment }}
              api={{ 
                id: 'popover-env-panel',
                title: `${environment?.name || 'Environment'} - Environment`,
                group: { location: { type: 'popover' } },
                onPanelOpen: () => setPopoverOpen(`env_${envId}`, false),
                onTaskSelect: setSelectedTask
              }}
            />
          </DockviewApiContext.Provider>
        </div>
        
        {/* Task Panel - Right Side */}
        {selectedTask && (
          <div className="w-1/2">
            <DockviewApiContext.Provider value={dockviewApi}>
              <TaskPanel 
                params={{ task: selectedTask, environment: environment }}
                api={{ 
                  id: 'popover-task-panel',
                  title: `${selectedTask?.name || 'Task'} - Task`,
                  group: { location: { type: 'popover' } },
                  onPanelOpen: () => setPopoverOpen(`env_${envId}`, false)
                }}
              />
            </DockviewApiContext.Provider>
          </div>
        )}
      </div>
    );
  };

    // Split Environment Panel Component
    const SplitTaskPanel = ({ environment, task }) => {
      const [selectedEnv, setSelectedEnv] = useState(null);
      return (
        <div className="h-full flex">
          {/* Environment Panel - Left Side */}
          { selectedEnv && (
            <div className='w-1/2' >
              <DockviewApiContext.Provider value={dockviewApi}>
                <EnvironmentPanel
                  params={{ environment: selectedEnv }}
                  api={{
                    id: 'popover-env-panel',
                    title: `${selectedEnv?.name || 'Environment'} - Environment`,
                    group: { location: { type: 'popover' } },
                    onTaskSelect: () => { } // Task selection handled differently in split view
                  }}
                />
              </DockviewApiContext.Provider>
            </div>
          )}
  
          {/* Task Panel - Right Side */}
  
          <div className={`${selectedEnv ? 'w-1/2' : 'w-full'} border-r border-gray-700`}>
            <DockviewApiContext.Provider value={dockviewApi}>
              <TaskPanel
                params={{ task: task, environment: selectedEnv ? environment : undefined }}
                api={{
                  id: 'popover-task-panel',
                  title: `${task?.name || 'Task'} - Task`,
                  group: { location: { type: 'popover' } },
                  // onPanelOpen: () => setTaskPopoverOpen(false),
                  onEnvSelect:setSelectedEnv
                  
                }}
              />
            </DockviewApiContext.Provider>
          </div>
  
        </div>
        
      );
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
    <div className="p-2.5 text-white h-full overflow-y-auto">
      {/* Environments and Tasks */}
      <div className="w-full">
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
                <Popover
                  key={env.id}
                  open={openPopovers[`env_${env.id}`] || false}
                  onOpenChange={(open) => setPopoverOpen(`env_${env.id}`, open)}
                >
                  <PopoverTrigger asChild>
                    <div className="p-2 px-3 my-1 bg-gray-800 rounded cursor-pointer border border-gray-700 hover:bg-gray-700 transition-colors">
                      {env.name}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent 
              className="w-[800px] h-screen p-0 bg-gray-900 border-gray-700"
              side="left"
              align="center"
            >
               <div className="h-full">
                 <SplitEnvironmentPanel environment={env} envId={env.id} />
               </div>
            </PopoverContent>
                </Popover>
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
                <Popover
                  key={task.id}
                  open={openPopovers[`task_${task.id}`] || false}
                  onOpenChange={(open) => setPopoverOpen(`task_${task.id}`, open)}
                >
                  <PopoverTrigger asChild>
                    <div className="p-2 px-3 my-1 bg-gray-800 rounded cursor-pointer border border-gray-700 hover:bg-gray-700 transition-colors">
                      {task.name}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent 
              className="w-[800px] h-screen p-0 bg-gray-900 border-gray-700"
              side="left"
              align="center"
            >
               <div className="h-full">
                <SplitTaskPanel  task={task} ></SplitTaskPanel>
                 {/* <DockviewApiContext.Provider value={dockviewApi}>
                   <TaskPanel 
                     params={{ task: task }}
                     api={{ 
                       id: 'popover-task-panel',
                       title: `${task?.name || 'Task'} - Task`,
                       group: { location: { type: 'popover' } },
                       onPanelOpen: () => setPopoverOpen(`task_${task.id}`, false)
                     }}
                   />
                 </DockviewApiContext.Provider> */}
               </div>
            </PopoverContent>
                </Popover>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftPanel;
