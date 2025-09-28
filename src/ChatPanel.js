import React, { useState, useRef, useEffect, useContext } from 'react';
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
import { Info, GitCompare, Menu, PanelLeft, X, ChevronLeft, ChevronRight, Eye, Pin } from 'lucide-react';
import EnvironmentPanel from './EnvironmentPanel';
import TaskDetailPanel from './TaskDetailPanel';
import useAppStore from './store/useAppStore';

const ChatPanel = (props) => {
  const dockviewApi = useContext(DockviewApiContext);

  // Multiple chats state (each chat keeps its own configuration)
  const [chats, setChats] = useState([
    {
      id: 'chat1',
      title: 'Chat 1',
      type: undefined, // determined on first message
      messages: [],
      locked: false,
      isRemote: false,
      environmentId: undefined,
      sendMode: 'interactive', // 'interactive' | 'schedule'
    }
  ]);
  const [activeChatId, setActiveChatId] = useState('chat1');
  const [inputMessage, setInputMessage] = useState('');
  // removed unused taskPopover/extra states to keep UI minimal
  const [envPopoverOpen, setEnvPopoverOpen] = useState(false);
  const [envViewMode, setEnvViewMode] = useState('info');
  const [chatListOpen, setChatListOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  // removed unused taskViewMode and showTaskTabs
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);
  
  // Get environments and pending chat requests from Zustand store
  const { environments, pendingTaskChats, removePendingTaskChat, chatEnvironmentOpenMode, setChatEnvironmentOpenMode } = useAppStore();
  const messagesEndRef = useRef(null);
  const panelRef = useRef(null);
  const tabsScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const activeChat = chats.find(chat => chat.id === activeChatId);
  const activeEnv = environments.find(env => env.id === (activeChat?.environmentId || '')) || null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const updateTabScrollButtons = React.useCallback(() => {
    const el = tabsScrollRef.current;
    if (!el) return;
    const { scrollLeft, clientWidth, scrollWidth } = el;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateTabScrollButtons();
    const el = tabsScrollRef.current;
    if (!el) return;
    const handleScroll = () => updateTabScrollButtons();
    el.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateTabScrollButtons);
    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateTabScrollButtons);
    };
  }, [updateTabScrollButtons, chats.length]);

  const scrollTabs = (direction) => {
    const el = tabsScrollRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.7);
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  // Helpers to open environment views based on selected mode
  const openEnvironmentFromChat = () => {
    if (!activeEnv) return;
    const api = dockviewApi;
    if (chatEnvironmentOpenMode === 'preview') {
      // handled by popover buttons below when preview is active
      return;
    }
    if (chatEnvironmentOpenMode === 'general') {
      try {
        let generalPanel = api?.getPanel('general_environment_panel');
        if (!generalPanel && api) {
          api.addPanel({
            id: 'general_environment_panel',
            component: 'EnvironmentPanel',
            title: 'Environment Panel',
            params: { environment: activeEnv },
            position: { referencePanel: 'chat_panel', direction: 'right' },
          });
          generalPanel = api.getPanel('general_environment_panel');
        }
        // update global general env via store already used by EnvironmentPanel
        useAppStore.getState().setCurrentGeneralEnvironment(activeEnv);
        generalPanel?.focus();
      } catch (e) {
        console.error('Error opening general environment panel from chat:', e);
      }
      return;
    }
    if (chatEnvironmentOpenMode === 'pinned') {
      try {
        const uniqueId = `pinned_environment_panel_${activeEnv.id}_${Date.now()}`;
        const panel = api?.addPanel({
          id: uniqueId,
          component: 'EnvironmentPanel',
          title: 'Pinned Environment',
          params: { environment: activeEnv, isPinned: true },
          position: { referencePanel: 'chat_panel', direction: 'right' },
        });
        panel?.focus();
      } catch (e) {
        console.error('Error opening pinned environment panel from chat:', e);
      }
    }
  };

  // Consume pending task chat requests: ensure ChatPanel shows a new tab per task
  useEffect(() => {
    if (!pendingTaskChats || pendingTaskChats.length === 0) return;
    pendingTaskChats.forEach((req) => {
      const task = req.task;
      if (!task) return;
      // If a task chat for this task already exists, focus it instead of creating a new one
      const existing = chats.find((c) => c.type === 'task' && c.taskId === task.id);
      if (existing) {
        setActiveChatId(existing.id);
        removePendingTaskChat(req.id);
        return;
      }

      const env = environments.find(e => e.id === task.environmentId);
      const newChatId = `task_${task.id}_${Date.now()}`;
      const initialMessages = [
        {
          id: 1,
          text: `Task loaded: ${task.name}`,
          sender: 'system',
          timestamp: new Date(),
        },
        {
          id: 2,
          text: `Status: ${task.status} • Priority: ${task.priority}${env ? ` • Environment: ${env.name}` : ''}`,
          sender: 'system',
          timestamp: new Date(),
        },
      ];
      const newChat = {
        id: newChatId,
        title: task.name || `Task ${task.id}`,
        type: 'task',
        taskId: task.id,
        messages: initialMessages,
        locked: true,
        isRemote: !!env,
        environmentId: env?.id,
        sendMode: 'schedule',
      };
      setChats((prev) => [...prev, newChat]);
      setActiveChatId(newChatId);
      removePendingTaskChat(req.id);
    });
  }, [pendingTaskChats, removePendingTaskChat, environments, chats]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === '' || !activeChat) return;

    const newMessage = {
      id: activeChat.messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    // Determine chat type if this is the first message
    const chatType = activeChat.type || (activeChat.sendMode === 'schedule' ? 'task' : 'chat');

    // Update the active chat with new message and type
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === activeChatId
          ? { 
              ...chat, 
              messages: [...chat.messages, newMessage],
              type: chatType, // Set type based on send mode if not already set
              locked: true
            }
          : chat
      )
    );
    setInputMessage('');

    // Simulate a response after a short delay
    setTimeout(() => {
      const responseMessage = {
        id: activeChat.messages.length + 2,
        text: 'Thanks for your message! This is a simulated response.',
        sender: 'system',
        timestamp: new Date(),
      };

      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, responseMessage] }
            : chat
        )
      );
    }, 1000);
  };

  const addNewChat = () => {
    const newChatId = `chat${chats.length + 1}`;
    const newChat = {
      id: newChatId,
      title: `Chat ${chats.length + 1}`,
      type: undefined, // Type will be determined after first message
      messages: [] // Start with empty messages
    };

    setChats([...chats, newChat]);
    setActiveChatId(newChatId);
  };


  const switchChat = (chatId) => {
    setActiveChatId(chatId);
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

  // removed unused SplitEnvironmentPanel helper

  return (
    <div ref={panelRef} className="p-5 text-foreground bg-background h-full overflow-hidden flex relative">
      {/* Left Sidebar - Show when sidebar is enabled */}
      {showSidebar && (
        <div className="w-64 border-r border-border pr-4 mr-4 flex-shrink-0">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Chats</h3>
            <Button
              onClick={addNewChat}
              variant="outline"
              size="sm"
              className="w-full mb-3"
            >
              + New Chat
            </Button>
          </div>
          <div className="space-y-1 overflow-y-auto max-h-[calc(100%-120px)]">
            {chats.map((chat) => (
              <Button
                key={chat.id}
                onClick={() => switchChat(chat.id)}
                variant={chat.id === activeChatId ? "active" : "ghost"}
                size="sm"
                className="w-full justify-start h-auto p-2"
              >
                <div className="text-left">
                  <div className="font-medium truncate">{chat.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {chat.messages.length} messages • {chat.type || 'chat'}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">

      {/* Chat Tabs */}
      <div className="flex items-center mb-3.75 border-b border-border pb-2.5">
        {/* Chat Control Buttons */}
            <div className="flex items-center gap-1 mr-3">
          {/* Chat List Popover Button */}
          <Popover open={chatListOpen} onOpenChange={setChatListOpen}>
            <PopoverTrigger asChild>
              <button className="p-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white border border-gray-600/50 hover:border-gray-500 rounded cursor-pointer transition-colors">
                <Menu className="w-3.5 h-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2 bg-gray-900 border-gray-700" side="bottom" align="start">
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-400 mb-2">All Chats</div>
                {chats.map((chat) => (
                  <Button
                    key={chat.id}
                    onClick={() => {
                      switchChat(chat.id);
                      setChatListOpen(false);
                    }}
                    variant={chat.id === activeChatId ? "active" : "ghost"}
                    size="sm"
                    className="w-full justify-start h-auto p-2"
                  >
                    <div className="text-left">
                      <div className="font-medium">{chat.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {chat.messages.length} messages • {chat.type || 'chat'}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Sidebar Toggle Button */}
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-1.5 border border-gray-600/50 hover:border-gray-500 rounded cursor-pointer transition-colors ${
              showSidebar 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white'
            }`}
          >
            <PanelLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {!showSidebar && (
          <div className="flex-1 flex items-center gap-2">
            <div className="relative h-9 flex-1">
              {/* Scrollable container without visible scrollbar; add side padding under overlay buttons */}
              <div className="absolute inset-0 overflow-hidden px-6">
                <div ref={tabsScrollRef} className="h-full overflow-x-auto no-scrollbar">
                  <div className="flex flex-row gap-0.5 w-max">
                    {chats.map((chat) => (
                      <Button
                        key={chat.id}
                        onClick={() => switchChat(chat.id)}
                        variant={chat.id === activeChatId ? "active" : "subtle"}
                        size="sm"
                        className="rounded-t-md rounded-b-none"
                      >
                        {chat.title}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Left/Right scroll buttons */}
              {canScrollLeft && (
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => scrollTabs('left')}
                  title="Scroll left"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
              )}
              {canScrollRight && (
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => scrollTabs('right')}
                  title="Scroll right"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            {/* New Chat button sits outside the scroll area on the right */}
            <Button
              onClick={addNewChat}
              variant="outline"
              size="sm"
              className="rounded-md"
            >
              + New Chat
            </Button>
            {/* Environment open mode toggle within chat header */}
          <div className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded p-0.5 ml-2">
            <Button
              size="sm"
              variant="outline"
              className={`px-2 py-1 text-xs ${chatEnvironmentOpenMode === 'preview' ? 'bg-gray-700 text-white border-gray-600' : 'bg-transparent text-gray-300 border-transparent hover:bg-gray-700'}`}
              onClick={() => setChatEnvironmentOpenMode('preview')}
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className={`px-2 py-1 text-xs ${chatEnvironmentOpenMode === 'general' ? 'bg-gray-700 text-white border-gray-600' : 'bg-transparent text-gray-300 border-transparent hover:bg-gray-700'}`}
              onClick={() => setChatEnvironmentOpenMode('general')}
              title="Environment Panel"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className={`px-2 py-1 text-xs ${chatEnvironmentOpenMode === 'pinned' ? 'bg-gray-700 text-white border-gray-600' : 'bg-transparent text-gray-300 border-transparent hover:bg-gray-700'}`}
              onClick={() => setChatEnvironmentOpenMode('pinned')}
              title="Pinned Panel"
            >
              <Pin className="h-4 w-4" />
            </Button>
            </div>
          </div>
        )}

      </div>

      {/* Combined Context Strip - Show when chat has messages */}
      {activeChat?.messages.length > 0 && (
        <div className="mb-2 p-2 bg-muted/50 border border-border rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mode and Type Display */}
              <span className="text-muted-foreground text-xs font-medium">
                {(activeChat?.isRemote ? '🌐' : '💻')} {(activeChat?.isRemote ? 'Remote' : 'Local')} {(activeChat?.type === 'task' || activeChat?.sendMode === 'schedule') ? 'Task' : 'Chat'}:
              </span>
              
              {/* Environment Name (for Remote) or Chat Title */}
              <span className="text-foreground text-xs font-medium">
                {activeChat?.isRemote && activeEnv ? activeEnv.name : activeChat?.title}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {/* Task Tabs and View Task Button - Show for tasks */}
              {(activeChat?.type === 'task' || activeChat?.sendMode === 'schedule') && (
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
                                environment: activeEnv 
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
              {activeChat?.isRemote && activeEnv && (
                <>
                  <Popover open={envPopoverOpen && envViewMode === 'info'} onOpenChange={(open) => {
                    if (chatEnvironmentOpenMode === 'preview') {
                      if (open) setEnvViewMode('info');
                      setEnvPopoverOpen(open);
                    } else if (open) {
                      // non-preview modes open panel instead
                      setEnvPopoverOpen(false);
                      setEnvViewMode('info');
                      openEnvironmentFromChat();
                    }
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
                            params={{ environment: activeEnv }}
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
                    if (chatEnvironmentOpenMode === 'preview') {
                      if (open) setEnvViewMode('diff');
                      setEnvPopoverOpen(open);
                    } else if (open) {
                      setEnvPopoverOpen(false);
                      setEnvViewMode('diff');
                      openEnvironmentFromChat();
                    }
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
                            params={{ environment: activeEnv }}
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
      )}

      {/* Chat Messages Container or Empty State */}
      {activeChat?.messages.length > 0 ? (
        <div className="flex-1 overflow-y-auto bg-card rounded-lg p-3.75 mb-3.75 border border-border">
          {activeChat?.messages.map((message) => (
            <div
              key={message.id}
              className="mb-3 flex flex-col"
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
      ) : (
        // Empty State - Show only for new chats
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Start a New Conversation</h3>
            <p className="text-gray-500 mb-4">
              Type your message below to begin. Choose your mode and settings before sending.
            </p>
            <div className="text-sm text-gray-600">
              <p>• Select <span className="text-blue-400">Interactive</span> for real-time chat</p>
              <p>• Select <span className="text-purple-400">Schedule</span> for task planning</p>
              <p>• Toggle <span className="text-green-400">Remote</span> for environment access</p>
            </div>
          </div>
        </div>
      )}

      {/* Input Area - Modern Interface */}
      <div className=" p-4">
        {/* Message Input with Send Button Inside */}
        <div className="relative">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write your message here..."
            className="w-full p-3 pr-24 bg-background border border-input rounded-xl text-foreground resize-none text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            rows={3}
          />
          
          {/* Send Button Inside Textarea */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            {/* Mode Toggle */}
           
            
            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              variant="default"
              size="sm"
            >
              Send
            </Button>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between mt-4">
          {/* Left Side Controls */}
          <div className="flex flex-col items-start gap-2">
            {/* Remote Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remote-task"
                checked={!!activeChat?.isRemote}
                disabled={!!activeChat?.locked}
                onChange={(e) => {
                  const isRemote = e.target.checked;
                  setChats(prev => prev.map(c => c.id === activeChatId ? {
                    ...c,
                    isRemote,
                    environmentId: isRemote ? c.environmentId : undefined
                  } : c));
                }}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
              />
              <label htmlFor="remote-task" className="text-gray-300 text-sm font-medium cursor-pointer">
                Remote
              </label>
            </div>

            {/* Environment Dropdown - Show when Remote is checked */}
            {activeChat?.isRemote && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-400 text-sm">Environment:</span>
                <select
                  value={activeChat?.environmentId || ''}
                  disabled={!!activeChat?.locked}
                  onChange={(e) => {
                    const envId = e.target.value;
                    setChats(prev => prev.map(c => c.id === activeChatId ? {
                      ...c,
                      environmentId: envId || undefined
                    } : c));
                  }}
                  className="w-32 sm:w-40 px-2 py-1 bg-background border border-input rounded text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
                >
                  <option value="">Select Environment</option>
                  {environments.map((env) => (
                    <option key={env.id} value={env.id}>
                      {env.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Mode Indicator */}
          <div className="text-xs text-gray-400">
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                onClick={() => setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, sendMode: 'interactive' } : c))}
                variant={activeChat?.sendMode === 'interactive' ? 'active' : 'ghost'}
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={!!activeChat?.locked}
              >
                Interactive
              </Button>
              <Button
                onClick={() => setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, sendMode: 'schedule' } : c))}
                variant={activeChat?.sendMode === 'schedule' ? 'active' : 'ghost'}
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={!!activeChat?.locked}
              >
                Schedule
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Info */}
      <div className="mt-2.5 text-xs text-muted-foreground text-center">
        Chat Panel • Press Enter to send • Shift+Enter for new line
      </div>
      </div>
    </div>
  );
};

export default ChatPanel;