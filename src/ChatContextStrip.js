import React, { useContext } from 'react';
import { DockviewApiContext } from './App';
import { Button } from './components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from './components/ui/popover';
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './components/ui/drawer';
import { Info, GitCompare, X } from 'lucide-react';
import EnvironmentPanel from './EnvironmentPanel';
import TaskDetailPanel from './TaskDetailPanel';

const ChatContextStrip = ({
  activeChat,
  isRemoteTask,
  sendMode,
  selectedEnvironment,
  taskDrawerOpen,
  setTaskDrawerOpen,
  envPopoverOpen,
  setEnvPopoverOpen,
  envViewMode,
  setEnvViewMode,
  panelRef
}) => {
  const dockviewApi = useContext(DockviewApiContext);

  // Only render if chat has messages
  if (!activeChat?.messages.length) {
    return null;
  }

  return (
    <div className="mb-2 p-2 bg-muted/50 border border-border rounded-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mode and Type Display */}
          <span className="text-muted-foreground text-xs font-medium">
            {isRemoteTask ? '🌐' : '💻'} {isRemoteTask ? 'Remote' : 'Local'} {activeChat?.type === 'task' || sendMode === 'schedule' ? 'Task' : 'Chat'}:
          </span>
          
          {/* Environment Name (for Remote) or Chat Title */}
          <span className="text-foreground text-xs font-medium">
            {isRemoteTask && selectedEnvironment ? selectedEnvironment.name : activeChat.title}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Task Tabs and View Task Button - Show for tasks */}
          {(activeChat?.type === 'task' || sendMode === 'schedule') && (
            <div className="flex items-center gap-1">
              {/* Task Tabs - Show when showTaskTabs is true */}
             
              
              {/* View Task Button - Only show for task chats */}
              <Drawer open={taskDrawerOpen} onOpenChange={setTaskDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button
                    variant="subtle"
                    size="sm"
                    className="text-xs"
                  >
                    View Task
                  </Button>
                </DrawerTrigger>
                <DrawerContent container={panelRef.current} withinContainer className="h-[80%]">
                  <div className="mx-auto w-full max-w-4xl h-full flex flex-col">
                    <DrawerHeader className="border-b border-border pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <DrawerTitle className="text-left">Task Details</DrawerTitle>
                          <DrawerDescription className="text-left">
                            {activeChat?.title} - Detailed task information and controls
                          </DrawerDescription>
                        </div>
                        <DrawerClose asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                          </Button>
                        </DrawerClose>
                      </div>
                    </DrawerHeader>
                    
                    <div className="flex-1 overflow-hidden">
                      <DockviewApiContext.Provider value={dockviewApi}>
                        <TaskDetailPanel
                          params={{ 
                            task: { 
                              name: activeChat?.title || 'Untitled Task',
                              id: activeChat?.id 
                            }, 
                            environment: selectedEnvironment 
                          }}
                          api={{
                            id: 'drawer-task-detail-panel',
                            title: 'Task Details',
                            group: { location: { type: 'drawer' } }
                          }}
                        />
                      </DockviewApiContext.Provider>
                    </div>
                    
                    <DrawerFooter className="border-t border-border pt-4">
                      <div className="flex justify-end gap-2">
                        <DrawerClose asChild>
                          <Button variant="outline">Close</Button>
                        </DrawerClose>
                        <Button>Save Changes</Button>
                      </div>
                    </DrawerFooter>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          )}

          {/* Info/Diff Buttons - Show for Remote */}
          {isRemoteTask && selectedEnvironment && (
            <>
              <Popover open={envPopoverOpen && envViewMode === 'info'} onOpenChange={(open) => {
                if (open) setEnvViewMode('info');
                setEnvPopoverOpen(open);
              }}>
                <PopoverTrigger asChild>
                  <button className="p-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white border border-gray-600/50 hover:border-gray-500 rounded cursor-pointer transition-colors">
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[800px] h-screen p-0 bg-gray-900 border-gray-700" side="left" align="center">
                  <div className="h-full">
                    <DockviewApiContext.Provider value={dockviewApi}>
                      <EnvironmentPanel
                        params={{ environment: selectedEnvironment }}
                        api={{
                          id: 'popover-env-info-panel',
                          title: 'Environment Info',
                          group: { location: { type: 'popover' } },
                          onTaskSelect: () => {}
                        }}
                      />
                    </DockviewApiContext.Provider>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Popover open={envPopoverOpen && envViewMode === 'diff'} onOpenChange={(open) => {
                if (open) setEnvViewMode('diff');
                setEnvPopoverOpen(open);
              }}>
                <PopoverTrigger asChild>
                  <button className="p-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white border border-gray-600/50 hover:border-gray-500 rounded cursor-pointer transition-colors">
                    <GitCompare className="w-3.5 h-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[800px] h-screen p-0 bg-gray-900 border-gray-700" side="left" align="center">
                  <div className="h-full">
                    <DockviewApiContext.Provider value={dockviewApi}>
                      <EnvironmentPanel
                        params={{ environment: selectedEnvironment }}
                        api={{
                          id: 'popover-env-diff-panel',
                          title: 'Environment Diff',
                          group: { location: { type: 'popover' } },
                          onTaskSelect: () => {}
                        }}
                      />
                    </DockviewApiContext.Provider>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatContextStrip;
