import React, { useState, useContext } from 'react';
import { DockviewApiContext } from './App';
import { Button } from './components/ui/button';
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import EnvironmentPanel from './EnvironmentPanel';
import TaskPanel from './TaskPanel';
import useAppStore from './store/useAppStore';
import { SquareArrowOutUpRight, Pin } from 'lucide-react';

const LeftPanel = (props) => {
  const { api } = props;
  const dockviewApi = useContext(DockviewApiContext);
  
  console.log('LeftPanel props:', props);
  console.log('panel api:', api);
  console.log('context dockviewApi:', dockviewApi);
  console.log('panel api keys:', Object.keys(api || {}));
  console.log('panel group:', api?.group);
  console.log('panel group keys:', Object.keys(api?.group || {}));

  // Zustand store state and actions
  const {
    environments,
    activeTab,
    openPopovers,
    selectedTaskInEnv,
    taskSortBy,
    taskFilterBy,
    setActiveTab,
    setPopoverOpen,
    setSelectedTaskInEnv,
    setTaskSortBy,
    setTaskFilterBy,
    getEnvironmentById,
    getFilteredAndSortedTasks,
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

  return (
    <div className="p-2.5 text-white h-full overflow-y-auto">
      {/* Header with Tabs and Controls */}
      <div className="flex items-center justify-between mb-4">
        {/* Left-aligned Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-shrink-0">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="environments" className="data-[state=active]:bg-gray-700">
              Environments
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-gray-700">
              Tasks
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Right-side Controls (only show for tasks tab) */}
        {activeTab === 'tasks' && (
          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="bg-gray-800 border-gray-700 hover:bg-gray-700">
                  Sort: {taskSortBy}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 bg-gray-900 border-gray-700">
                <div className="space-y-1">
                  <div
                    className="cursor-pointer p-2 hover:bg-gray-700 rounded text-sm"
                    onClick={() => setTaskSortBy('name')}
                  >
                    Name
                  </div>
                  <div
                    className="cursor-pointer p-2 hover:bg-gray-700 rounded text-sm"
                    onClick={() => setTaskSortBy('status')}
                  >
                    Status
                  </div>
                  <div
                    className="cursor-pointer p-2 hover:bg-gray-700 rounded text-sm"
                    onClick={() => setTaskSortBy('priority')}
                  >
                    Priority
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Filter Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="bg-gray-800 border-gray-700 hover:bg-gray-700">
                  Filter: {taskFilterBy}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 bg-gray-900 border-gray-700">
                <div className="space-y-1">
                  <div
                    className="cursor-pointer p-2 hover:bg-gray-700 rounded text-sm"
                    onClick={() => setTaskFilterBy('all')}
                  >
                    All
                  </div>
                  <div
                    className="cursor-pointer p-2 hover:bg-gray-700 rounded text-sm"
                    onClick={() => setTaskFilterBy('pending')}
                  >
                    Pending
                  </div>
                  <div
                    className="cursor-pointer p-2 hover:bg-gray-700 rounded text-sm"
                    onClick={() => setTaskFilterBy('in-progress')}
                  >
                    In Progress
                  </div>
                  <div
                    className="cursor-pointer p-2 hover:bg-gray-700 rounded text-sm"
                    onClick={() => setTaskFilterBy('completed')}
                  >
                    Completed
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="space-y-2">
        {activeTab === 'environments' && (
          <div>
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

        {activeTab === 'tasks' && (
          <div>
            {getFilteredAndSortedTasks().map((task) => {
              const taskEnvironment = getEnvironmentById(task.environmentId);
              return (
                <div key={task.id} className="my-1">
                  <div className="p-2 px-3 bg-gray-800 rounded border border-gray-700 hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-3">
                      {/* Environment Button */}
                      <Popover
                        open={openPopovers[`task_env_${task.id}`] || false}
                        onOpenChange={(open) => setPopoverOpen(`task_env_${task.id}`, open)}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-shrink-0 bg-blue-700 border-blue-600 hover:bg-blue-600 text-blue-100 text-xs px-2 py-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {taskEnvironment?.name || 'Unknown'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-[800px] h-screen p-0 bg-gray-900 border-gray-700"
                          side="left"
                          align="center"
                        >
                          <div className="h-full">
                            <SplitEnvironmentPanel environment={taskEnvironment} envId={taskEnvironment?.id} />
                          </div>
                        </PopoverContent>
                      </Popover>

                      {/* Task Content - Clickable area for task details */}
                      <Popover
                        open={openPopovers[`task_${task.id}`] || false}
                        onOpenChange={(open) => setPopoverOpen(`task_${task.id}`, open)}
                      >
                        <PopoverTrigger asChild>
                          <div className="flex-1 flex items-center justify-between cursor-pointer">
                            <span>{task.name}</span>
                            <div className="flex items-center gap-2 text-xs">
                              <span className={`px-2 py-1 rounded ${
                                task.status === 'completed' ? 'bg-green-700 text-green-100' :
                                task.status === 'in-progress' ? 'bg-yellow-700 text-yellow-100' :
                                'bg-gray-600 text-gray-100'
                              }`}>
                                {task.status}
                              </span>
                              <span className={`px-2 py-1 rounded ${
                                task.priority === 'high' ? 'bg-red-700 text-red-100' :
                                task.priority === 'medium' ? 'bg-orange-700 text-orange-100' :
                                'bg-blue-700 text-blue-100'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-[800px] h-screen p-0 bg-gray-900 border-gray-700"
                          side="left"
                          align="center"
                        >
                          <div className="h-full">
                            <SplitTaskPanel task={task} />
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftPanel;
