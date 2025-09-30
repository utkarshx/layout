import React, { useContext, useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { DockviewApiContext } from './App';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import TaskPanel from './TaskPanel';
import useAppStore from './store/useAppStore';

const EnvironmentTasksPanel = (props) => {
  const { params } = props;
  const { environment, isPinnedFromParent: isPinnedFromParams } = params || {};
  
  // Preserve isPinned across re-renders using a ref
  const isPinnedRef = useRef(typeof isPinnedFromParams === 'boolean' ? isPinnedFromParams : true);
  useEffect(() => {
    if (typeof isPinnedFromParams === 'boolean') {
      isPinnedRef.current = isPinnedFromParams;
    }
  }, [isPinnedFromParams]);

  // isPinnedFromParent is now accessed directly from the ref when needed
  const dockviewApi = useContext(DockviewApiContext);
  const {
    pinnedTaskOpenMode,
    openPopovers,
    setPopoverOpen,
    tasks,
  } = useAppStore();
  const [localOpenStates, setLocalOpenStates] = useState({});
  const lastOpenTimestampsRef = useRef({});

  const closePopover = useCallback((key) => {
    if (isPinnedRef.current) {
      setLocalOpenStates((prev) => ({ ...prev, [key]: false }));
    } else {
      setPopoverOpen(key, false);
    }
  }, [setPopoverOpen]);
  const environmentTasks = useMemo(() => {
    const list = Array.isArray(tasks) ? tasks : [];
    if (!environment?.id) return list;
    return list.filter((t) => t.environmentId === environment.id);
  }, [tasks, environment]);




  const getRightReferenceId = () => {
    const candidates = ['pinned_environment_panel', 'chat_panel', 'todo_panel'];
    for (const id of candidates) {
      if (dockviewApi?.getPanel(id)) return id;
    }
    if (dockviewApi?.getPanel('environment_list')) return 'environment_list';
    return 'left_panel';
  };

  const openTaskChatPanel = (task) => {
    if (!task) return;
    try {
      let chatPanel = dockviewApi?.getPanel('chat_panel');
      if (!chatPanel && dockviewApi) {
        dockviewApi.addPanel({
          id: 'chat_panel',
          component: 'ChatPanel',
          title: 'Chat',
          position: { referencePanel: 'left_panel', direction: 'right' },
        });
        chatPanel = dockviewApi?.getPanel('chat_panel');
      }
      chatPanel?.focus();
    } catch (e) {
      console.error('Error ensuring chat panel exists:', e);
    }
    try {
      useAppStore.getState().addPendingTaskChat(task);
    } catch (e) {
      console.error('Error dispatching pending task chat:', e);
    }
  };

  const openTaskSeparatePanel = (task) => {
    if (!task || !dockviewApi) return;
    const panelId = `task_panel_${task.id}_${Date.now()}`;
    try {
      const panel = dockviewApi.addPanel({
        id: panelId,
        component: 'TaskPanel',
        title: task.name,
        params: { task },
        position: { referencePanel: getRightReferenceId(), direction: 'left' },
      });
      panel?.focus();
    } catch (error) {
      console.error('Error adding task panel:', error);
    }
  };

  return (
    <div className="p-4 text-white h-full overflow-y-auto bg-gray-900">
      <h3 className="mb-4 text-lg font-semibold">
        {environment ? `${environment.name} - Tasks` : 'Environment Tasks'}
      </h3>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium">Task List</h4>
          <div className="text-xs text-gray-400">
            {environmentTasks.length} tasks
          </div>
        </div>
        
        <div className="space-y-2">
          {environmentTasks.map((t) => {
            const task = { ...t };
            const popoverKey = `pinned_task_${task.id}`;
            const isPinned = isPinnedRef.current;
            const isOpen = isPinned
              ? localOpenStates[popoverKey] || false
              : openPopovers[popoverKey] || false;

            return (
              <Popover
                key={task.id}
                open={isOpen}
                onOpenChange={(open) => {
                  const mode = isPinned ? pinnedTaskOpenMode : 'preview';
                  
                  if (mode === 'preview') {
                    if (isPinned) {
                      setLocalOpenStates((prev) => ({ ...prev, [popoverKey]: open }));
                    } else {
                      setPopoverOpen(popoverKey, open);
                    }
                  } else if (mode === 'chat') {
                    if (open) {
                      openTaskChatPanel(task);
                    }
                    closePopover(popoverKey);
                  } else if (mode === 'panel') {
                    if (open) {
                      openTaskSeparatePanel(task);
                    }
                    closePopover(popoverKey);
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <div
                    className="p-3 cursor-pointer transition-colors bg-gray-800 hover:bg-gray-700"
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-sm">{task.name}</div>
                      <div className="flex gap-2">
                        <span className="text-xs px-2 py-1 rounded bg-gray-600 text-gray-200 border border-gray-500">
                          {task.priority}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200 border border-gray-500">
                          {task.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent 
                  className="z-[9999] w-[800px] h-screen p-0 bg-gray-900 border-gray-700"
                  side="left"
                  align="center"
                >
                  <div className="h-full">
                    <DockviewApiContext.Provider value={dockviewApi}>
                      <TaskPanel 
                        params={{ task: task, environment: environment }}
                        api={{ 
                          id: 'popover-task-panel',
                          title: `${task?.name || 'Task'} - Task`,
                          group: { location: { type: 'popover' } },
                          onPanelOpen: () => closePopover(popoverKey)
                        }}
                      />
                    </DockviewApiContext.Provider>
                  </div>
                </PopoverContent>
              </Popover>
            );
          })}
        </div>
      </div>
      

    </div>
  );
};

export default EnvironmentTasksPanel;