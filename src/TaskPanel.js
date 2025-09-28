import React, { useState, useEffect, useContext, useMemo } from 'react';
import { DockviewReact } from 'dockview-react';
import { DockviewApiContext } from './App';
import { Button } from './components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import EnvironmentPanel from './EnvironmentPanel';
import TaskDetailPanel from './TaskDetailPanel';
import TaskChatPanel from './TaskChatPanel';
import {
  SquareArrowOutUpRight
} from 'lucide-react';

const TaskPanel = (props) => {
  const { params, api } = props;
  const {onEnvSelect}=api ||{}
  // const { params,  } = props;

  const { environment, task } = params || {};
  const dockviewApi = useContext(DockviewApiContext);
  
  
  // Floating environment panel state
  const [activeEnvironmentPanel, setActiveEnvironmentPanel] = useState(null);
  
  
  // Track if environment is selected
  const [isEnvironmentSelected, setIsEnvironmentSelected] = useState(!!environment);
  
  // Nested dockview components
  const nestedComponents = useMemo(() => ({
    TaskDetailPanel: (props) => <TaskDetailPanel {...props} />,
    TaskChatPanel: (props) => <TaskChatPanel {...props} />,
  }), []);

  // Nested dockview setup
  const onNestedReady = (event) => {
    const { api: nestedApi } = event;
    console.log('Nested Dockview API ready:', nestedApi);

    try {
      // Add task detail panel
      nestedApi.addPanel({
        id: 'task_detail',
        component: 'TaskDetailPanel',
        title: 'Task Detail',
        params: { task, environment },
      });

      // Add task chat panel in the same group (as a tab)
      nestedApi.addPanel({
        id: 'task_chat',
        component: 'TaskChatPanel',
        title: 'Chat',
        params: { task },
      });

      console.log('Nested panels added successfully');
    } catch (error) {
      console.error('Error adding nested panels:', error);
    }
  };

  // Update environment selection state when environment prop changes
  useEffect(() => {
    setIsEnvironmentSelected(!!environment);
  }, [environment]);
  
  // Reset environment selection when task changes (optional)
  useEffect(() => {
    if (!environment) {
      setIsEnvironmentSelected(false);
    }
  }, [task, environment]);
  
  // Check if this is a floating panel or regular panel
  const isFloatingPanel = api?.group?.location?.type === 'floating';
  
  // Check if this panel is opened from a popover
  const isOpenedFromPopover = api?.group?.location?.type === 'popover';

  // Add click outside to close functionality for environment panel
  useEffect(() => {
    if (!activeEnvironmentPanel) return;
    
    const handleClickOutside = (event) => {
      // Check if click is outside any floating panel
      const floatingPanels = document.querySelectorAll('.dockview-floating-group');
      let clickedInsidePanel = false;
      
      floatingPanels.forEach(panel => {
        if (panel.contains(event.target)) {
          clickedInsidePanel = true;
        }
      });
      
      // If clicked outside all floating panels, close environment panel
      if (!clickedInsidePanel) {
        const panel = dockviewApi?.getPanel(activeEnvironmentPanel);
        if (panel) {
          panel.api.close();
        }
        setActiveEnvironmentPanel(null);
      }
    };
    
    // Add event listener with delay to avoid immediate closing
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeEnvironmentPanel, dockviewApi]);


  const openEnvironmentPanel = (environment) => {
    if (onEnvSelect) {
      onEnvSelect(environment);
      setIsEnvironmentSelected(true);
    }
    // if (!environment || !dockviewApi) return;
    
    // const panelId = `env_panel_${environment.name?.replace(/\s+/g, '_')}_${Date.now()}`;
    
    // try {
    //   // Close existing environment panel if open
    //   if (activeEnvironmentPanel) {
    //     const existingPanel = dockviewApi.getPanel(activeEnvironmentPanel);
    //     if (existingPanel) {
    //       existingPanel.api.close();
    //     }
    //   }
      
    //   // Add environment panel to main dockview
    //   const panel = dockviewApi.addPanel({
    //     id: panelId,
    //     component: 'EnvironmentPanel',
    //     title: `${environment.name} - Environment`,
    //     params: { environment: environment },
    //   });
      
    //   // Get current task panel position to calculate left-side placement
    //   // For regular panels, we need to find the panel element
    //   const currentPanelElement = isFloatingPanel ? 
    //     document.querySelector('.dockview-floating-group') : 
    //     document.querySelector(`[data-panel-id="${api.id}"]`);
    //   const panelRect = currentPanelElement?.getBoundingClientRect();
      
    //   // Position to the left of current task panel with full height
    //   const x = panelRect ? panelRect.left - 710 : 100; // 700px width + 10px gap
    //   const y = 0; // Start from top
    //   const width = 700;
    //   const height = window.innerHeight; // Full height
      
    //   // Convert to floating group
    //   dockviewApi.addFloatingGroup(panel, {
    //     width: width,
    //     height: height,
    //     x: x,
    //     y: y,
    //   });
      
    //   // Track this floating environment panel
    //   setActiveEnvironmentPanel(panelId);
      
    //   console.log('Environment floating panel added successfully');
    // } catch (error) {
    //   console.error('Error adding environment floating panel:', error);
    // }
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
    <div className="text-white h-full overflow-hidden">
      <div className="p-2.5 border-b border-gray-700 bg-black flex justify-between items-center">
        <h4 className="m-0">
          {task ? `${task.name} - Task Details` : 'Task Details'}
        </h4>
        {isOpenedFromPopover && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              openTaskInNewPanel(task);
              // Call onPanelOpen callback if provided (for popover closing)
              if (api?.onPanelOpen) {
                api.onPanelOpen();
              }
            }}
           className="h-5 w-5 sm:h-6 sm:w-6 p-0 flex-shrink-0"
            title="Open in new panel"
          >
            {/* <span>⊞</span> */}
            <SquareArrowOutUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />

          </Button>
        )}
      </div>
      
      <div className="h-[calc(100%-50px)] p-5 overflow-hidden flex flex-col">
        <div className="flex items-center mb-3.75 gap-3.75">
          {/* Show Environment button only if environment is not selected and not in floating panels */}
          {!isEnvironmentSelected && environment && !isFloatingPanel && (
            <Button
              onClick={() => openEnvironmentPanel(environment)}
              className="p-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded cursor-pointer text-sm font-bold flex items-center gap-1.5 transition-colors flex-shrink-0 border border-gray-600"
            >
              Environment
            </Button>
          )}
          {!isEnvironmentSelected && task && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                onClick={() => {
                
                  // setSelectedTask(task);
                  if (onEnvSelect) {
                   
                   let env= { id: 'env1', name: 'Development Environment' }
              
                    onEnvSelect(env);
                    setIsEnvironmentSelected(true);
                  }
                }}
                  // onClick={openEnvironmentPanelInPopOver}
                  className="p-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded cursor-pointer text-sm font-bold flex items-center gap-1.5 transition-colors flex-shrink-0 border border-gray-600"
                >
                   Environment 🌍
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-[800px] h-screen p-0 bg-gray-900 border-gray-700"
                side="left"
                align="center"
              >
                <div className="h-full">
                  <DockviewApiContext.Provider value={dockviewApi}>
                    <EnvironmentPanel 
                      params={{ environment: environment }}
                      api={{ 
                        id: 'popover-env-panel',
                        title: `${environment?.name || 'Environment'} - Environment`,
                        group: { location: { type: 'popover' } }
                      }}
                    />
                  </DockviewApiContext.Provider>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      
      {/* Nested Dockview for Task Detail and Chat */}
      <div className="flex-1 overflow-hidden">
        <DockviewReact
          components={nestedComponents}
          onReady={onNestedReady}
          className="dockview-theme-dark"
        />
      </div>
      </div>
    </div>
  );
};

export default TaskPanel;
