import React, { useState, useContext } from 'react';
import { DockviewApiContext } from './App';
import { Button } from './components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import EnvironmentPanel from './EnvironmentPanel';
import TaskPanel from './TaskPanel';
import useAppStore from './store/useAppStore';

const EnvironmentLeftPanel = (props) => {
  const { api } = props;
  const dockviewApi = useContext(DockviewApiContext);
  
  console.log('EnvironmentLeftPanel props:', props);
  console.log('panel api:', api);
  console.log('context dockviewApi:', dockviewApi);
  console.log('panel api keys:', Object.keys(api || {}));
  console.log('panel group:', api?.group);
  console.log('panel group keys:', Object.keys(api?.group || {}));

  // Zustand store state and actions
  const {
    environments,
    openPopovers,
    selectedTaskInEnv,
    setPopoverOpen,
    setSelectedTaskInEnv,
  } = useAppStore();

  // Split Environment Panel Component
  const SplitEnvironmentPanel = ({ environment, envId }) => {
    const selectedTask = selectedTaskInEnv[envId] || null;
    const handleTaskSelect = (task) => setSelectedTaskInEnv(envId, task);

    // Functions to open environment panels
    const openGeneralEnvironmentPanel = () => {
      if (dockviewApi) {
        const panelId = `general_environment_panel`;
        try {
          dockviewApi.addPanel({
            id: panelId,
            component: 'EnvironmentPanel',
            title: 'Environment Panel',
            params: { environment: environment },
            position: { referencePanel: 'left_panel', direction: 'right' },
          });
          setPopoverOpen(`env_${envId}`, false);
        } catch (error) {
          console.error('Error adding general environment panel:', error);
        }
      }
    };

    const openPinnedEnvironmentPanel = () => {
      if (dockviewApi) {
        const panelId = `pinned_environment_panel`;
        try {
          dockviewApi.addPanel({
            id: panelId,
            component: 'EnvironmentPanel',
            title: 'Pinned Environment',
            params: { environment: environment, isPinned: true },
            position: { referencePanel: 'left_panel', direction: 'right' },
          });
          setPopoverOpen(`env_${envId}`, false);
        } catch (error) {
          console.error('Error adding pinned environment panel:', error);
        }
      }
    };

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
                onTaskSelect: handleTaskSelect,
                openGeneralPanel: openGeneralEnvironmentPanel,
                openPinnedPanel: openPinnedEnvironmentPanel
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

  // Split Task Panel Component
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
                onEnvSelect:setSelectedEnv
                
              }}
            />
          </DockviewApiContext.Provider>
        </div>

      </div>
      
    );
  };

  return (
    <div className="p-2.5 text-white h-full overflow-y-auto">
     

      {/* Header with Controls */}
      <div className="flex items-center justify-between mb-4">
        {/* Left-aligned Title */}
        <h3 className="text-white font-medium text-sm">Environments</h3>

        {/* Right-side Controls */}
        <div className="flex items-center gap-2">
            {/* Tasks Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="bg-gray-800 border-gray-700 hover:bg-gray-700">
                  Tasks
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 bg-gray-900 border-gray-700">
                <div className="space-y-1">
                  <div
                    className="cursor-pointer p-2 hover:bg-gray-700 rounded text-sm"
                    onClick={() => {
                      if (dockviewApi) {
                        // Check if task panel already exists
                        const existingPanel = dockviewApi.getPanel('task_panel');
                        if (!existingPanel) {
                          dockviewApi.addPanel({
                            id: 'task_panel',
                            component: 'TaskPanel',
                            title: 'Tasks',
                            position: { referencePanel: 'left_panel', direction: 'right' },
                          });
                        } else {
                          existingPanel.focus();
                        }
                      }
                    }}
                  >
                    Open Tasks Panel
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
      </div>

      {/* Environments Content */}
      <div className="space-y-2">
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
    </div>
  );
};

export default EnvironmentLeftPanel;