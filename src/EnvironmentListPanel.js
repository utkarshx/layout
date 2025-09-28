import React, { useContext } from 'react';
import { DockviewApiContext } from './App';
import { Button } from './components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import EnvironmentPanel from './EnvironmentPanel';
import TaskPanel from './TaskPanel';
import useAppStore from './store/useAppStore';
import { Eye, Pin, PanelLeft } from 'lucide-react';

const EnvironmentListPanel = (props) => {
  const { api } = props;
  const dockviewApi = useContext(DockviewApiContext);
  const getRightReferenceId = () => {
    const candidates = ['chat_panel', 'todo_panel'];
    for (const id of candidates) {
      if (dockviewApi?.getPanel(id)) return id;
    }
    if (dockviewApi?.getPanel('environment_list')) return 'environment_list';
    return 'left_panel';
  };
  
  console.log('EnvironmentListPanel props:', props);
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
    environmentOpenMode,
    setEnvironmentOpenMode,
    setCurrentGeneralEnvironment,
    setPinnedEnvironment,
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

  return (
    <div className="p-2.5 text-white h-full overflow-y-auto">
     

      {/* Header with Controls */}
      <div className="flex items-center justify-between mb-4">
        {/* Left-aligned Title */}
        <h3 className="text-white font-medium text-sm">Environments</h3>

        {/* Right-side Controls */}
        <div className="flex items-center gap-2">
            {/* Environment open mode toggle */}
            <div className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded p-0.5">
              <Button
                size="sm"
                variant="outline"
                className={`px-2 py-1 text-xs ${environmentOpenMode === 'preview' ? 'bg-gray-700 text-white border-gray-600' : 'bg-transparent text-gray-300 border-transparent hover:bg-gray-700'}`}
                onClick={() => setEnvironmentOpenMode('preview')}
                title="Preview"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={`px-2 py-1 text-xs ${environmentOpenMode === 'pinned' ? 'bg-gray-700 text-white border-gray-600' : 'bg-transparent text-gray-300 border-transparent hover:bg-gray-700'}`}
                onClick={() => setEnvironmentOpenMode('pinned')}
                title="Pinned Panel"
              >
                <Pin className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={`px-2 py-1 text-xs ${environmentOpenMode === 'general' ? 'bg-gray-700 text-white border-gray-600' : 'bg-transparent text-gray-300 border-transparent hover:bg-gray-700'}`}
                onClick={() => setEnvironmentOpenMode('general')}
                title="Environment Panel"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </div>
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
            onOpenChange={(open) => {
              if (environmentOpenMode === 'preview') {
                setPopoverOpen(`env_${env.id}`, open);
                return;
              }
              if (open) {
                if (environmentOpenMode === 'general') {
                  // Focus existing general panel and change environment
                  let generalPanel = dockviewApi?.getPanel('general_environment_panel');
                  if (!generalPanel && dockviewApi) {
                    try {
                      dockviewApi.addPanel({
                        id: 'general_environment_panel',
                        component: 'EnvironmentPanel',
                        title: 'Environment Panel',
                        params: { environment: env },
                        position: { referencePanel: getRightReferenceId(), direction: 'left' },
                      });
                      generalPanel = dockviewApi.getPanel('general_environment_panel');
                    } catch (e) {
                      console.error('Error creating general environment panel:', e);
                    }
                  }
                  if (generalPanel) {
                    setCurrentGeneralEnvironment(env);
                    generalPanel.focus();
                  }
                } else if (environmentOpenMode === 'pinned') {
                  // Always open a new pinned environment panel for the selected env
                  const uniqueId = `pinned_environment_panel_${env.id}_${Date.now()}`;
                  try {
                    const panel = dockviewApi?.addPanel({
                      id: uniqueId,
                      component: 'EnvironmentPanel',
                      title: 'Pinned Environment',
                      params: { environment: env, isPinned: true },
                      position: { referencePanel: getRightReferenceId(), direction: 'left' },
                    });
                    panel?.focus();
                  } catch (e) {
                    console.error('Error creating pinned environment panel:', e);
                  }
                }
              }
              setPopoverOpen(`env_${env.id}`, false);
            }}
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

export default EnvironmentListPanel;