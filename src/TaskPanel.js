import React, { useState, useRef, useEffect, useContext } from 'react';
import { DockviewApiContext } from './App';
import { Button } from './components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Input } from './components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import EnvironmentPanel from './EnvironmentPanel';
import {
 
  SquareArrowOutUpRight
} from 'lucide-react';

const TaskPanel = (props) => {
  const { params, api } = props;
  const {onEnvSelect}=api ||{}
  // const { params,  } = props;

  const { environment, task } = params || {};
  const dockviewApi = useContext(DockviewApiContext);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('detail');
  
  // Floating environment panel state
  const [activeEnvironmentPanel, setActiveEnvironmentPanel] = useState(null);
  
  // Popover state for environment panel
  const [isEnvironmentPopoverOpen, setIsEnvironmentPopoverOpen] = useState(false);
  
  // Track if environment is selected
  const [isEnvironmentSelected, setIsEnvironmentSelected] = useState(!!environment);
  
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
  
  // Chat state for task-specific chat
  const [messages, setMessages] = useState([
    { id: 1, text: `Welcome to the task chat for: ${task?.name || 'this task'}`, sender: 'system', timestamp: new Date() },
    { id: 2, text: 'You can discuss task-related details here.', sender: 'system', timestamp: new Date() },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    const newMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');

    // Simulate a response after a short delay
    setTimeout(() => {
      const responseMessage = {
        id: messages.length + 2,
        text: 'Message received! This is a task-specific response.',
        sender: 'system',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, responseMessage]);
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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

  const openEnvironmentPanelInPopOver = (environment) => {
    if (onEnvSelect) {
      onEnvSelect(environment);
      setIsEnvironmentSelected(true);
    }
    // setIsEnvironmentPopoverOpen(true);
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
              className="p-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded cursor-pointer text-sm font-bold flex items-center gap-1.5 transition-colors flex-shrink-0"
            >
              Environment
            </Button>
          )}
          {!isEnvironmentSelected && task && (
            <Popover open={isEnvironmentPopoverOpen} >
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
                  className="p-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded cursor-pointer text-sm font-bold flex items-center gap-1.5 transition-colors flex-shrink-0"
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
      
      {environment && (
        <div className="bg-gray-900 p-2.5 rounded mb-5 border border-gray-800">
          <strong>Environment:</strong> {environment.name}
        </div>
      )}
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-5">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="detail" className="data-[state=active]:bg-blue-600">Task Detail</TabsTrigger>
          <TabsTrigger value="chat" className="data-[state=active]:bg-blue-600">Chat</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'detail' && (
          <div>
            <div className="mb-5">
              <h3 className="mb-2.5">Task Details</h3>
              <p>This panel contains detailed information and controls for the selected task.</p>
              {task && (
                <div className="mt-3.75">
                  <p><strong>Task Name:</strong> {task.name}</p>
                  <p><strong>Status:</strong> <span className="text-orange-500">In Progress</span></p>
                  <p><strong>Priority:</strong> High</p>
                  <p><strong>Assigned to:</strong> John Doe</p>
                  <p><strong>Created:</strong> 2024-01-15</p>
                  <p><strong>Due Date:</strong> 2024-01-20</p>
                </div>
              )}
            </div>
            
            <div className="mb-5">
              <h4 className="mb-2">Actions</h4>
              <Button className="m-1 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer">
                Execute Task
              </Button>
              <Button className="m-1 bg-gray-600 hover:bg-gray-700 text-white rounded cursor-pointer">
                View Logs
              </Button>
            </div>
            
            <div>
              <h4 className="mb-2">Status</h4>
              <div className="bg-gray-800 p-2.5 rounded border border-gray-700">
                <div className="text-green-500">● Ready</div>
                <div className="text-xs text-gray-400 mt-1">
                  Last executed: Never
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full">
            {/* Chat Messages Container */}
            <div className="flex-1 overflow-y-auto bg-gray-900 rounded-lg p-3.75 mb-3.75 border border-gray-800">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="mb-3 flex flex-col items-end"
                  style={{ alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start' }}
                >
                  <div
                    className="max-w-[70%] p-2 px-3 rounded-xl text-white break-words"
                    style={{ backgroundColor: message.sender === 'user' ? '#007acc' : '#333' }}
                  >
                    {message.text}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            <div className="flex gap-2.5">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 p-2.5 bg-gray-800 border border-gray-700 rounded text-white resize-none text-sm font-inherit"
                rows={2}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="p-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </Button>
            </div>
            
            {/* Chat Info */}
            <div className="mt-2.5 text-xs text-gray-500 text-center">
              Task Chat • Press Enter to send • Shift+Enter for new line
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default TaskPanel;
