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
import { Info, GitCompare, Menu, PanelLeft, X } from 'lucide-react';
import TaskPanel from './TaskPanel';
import EnvironmentPanel from './EnvironmentPanel';
import TaskDetailPanel from './TaskDetailPanel';
import ChatContextStrip from './ChatContextStrip';
import useAppStore from './store/useAppStore';

const ChatPanel = (props) => {
  const dockviewApi = useContext(DockviewApiContext);

  // Multiple chats state
  const [chats, setChats] = useState([
    {
      id: 'chat1',
      title: 'Chat 1',
      type: 'chat',
      messages: [
       
      ]
    }
  ]);
  const [activeChatId, setActiveChatId] = useState('chat1');
  const [inputMessage, setInputMessage] = useState('');
  const [taskPopoverOpen, setTaskPopoverOpen] = useState(false);
  const [showEnvironmentInTaskPopover] = useState(false);
  const [isRemoteTask, setIsRemoteTask] = useState(false);
  const [sendMode, setSendMode] = useState('interactive');
  const [envPopoverOpen, setEnvPopoverOpen] = useState(false);
  const [envViewMode, setEnvViewMode] = useState('info');
  const [selectedEnvironment, setSelectedEnvironment] = useState(null);
  const [chatListOpen, setChatListOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [taskViewMode, setTaskViewMode] = useState('chat'); // 'chat' or 'detail'
  const [showTaskTabs, setShowTaskTabs] = useState(false);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);
  
  // Get environments from Zustand store
  const { environments } = useAppStore();
  const messagesEndRef = useRef(null);
  const panelRef = useRef(null);

  const activeChat = chats.find(chat => chat.id === activeChatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === '' || !activeChat) return;

    const newMessage = {
      id: activeChat.messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    // Determine chat type if this is the first message
    const chatType = activeChat.type || (sendMode === 'schedule' ? 'task' : 'chat');

    // Update the active chat with new message and type
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === activeChatId
          ? { 
              ...chat, 
              messages: [...chat.messages, newMessage],
              type: chatType // Set type based on send mode if not already set
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

  // Split Environment Panel Component
  const SplitEnvironmentPanel = ({ environment, task, showEnvironment }) => {
    const [selectedEnv, setSelectedEnv] = useState(null);
    return (
      <div className="h-full flex">
        {/* Environment Panel - Left Side */}
        {selectedEnv && (
          <div className='w-1/2' >
            <DockviewApiContext.Provider value={dockviewApi}>
              <EnvironmentPanel
                params={{ environment: selectedEnv }}
                api={{
                  id: 'popover-env-panel',
                  title: `${environment?.name || 'Environment'} - Environment`,
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
                onPanelOpen: () => setTaskPopoverOpen(false),
                onEnvSelect:setSelectedEnv
                
              }}
            />
          </DockviewApiContext.Provider>
        </div>

      </div>
      // <div className="h-full flex">
      //   {/* Environment Panel - Left Side */}
      //   {showEnvironment && (
      //     <div className="w-1/2 border-r border-gray-700">
      //       <DockviewApiContext.Provider value={dockviewApi}>
      //         <EnvironmentPanel
      //           params={{ environment: environment }}
      //           api={{
      //             id: 'popover-env-panel',
      //             title: `${environment?.name || 'Environment'} - Environment`,
      //             group: { location: { type: 'popover' } },
      //             onTaskSelect: () => {} // Task selection handled differently in split view
      //           }}
      //         />
      //       </DockviewApiContext.Provider>
      //     </div>
      //   )}

      //   {/* Task Panel - Right Side */}
      //   <div className={showEnvironment ? "w-1/2" : "w-full"}>
      //     <DockviewApiContext.Provider value={dockviewApi}>
      //       <TaskPanel
      //         params={{ task: task, environment: showEnvironment ? environment : undefined }}
      //         api={{
      //           id: 'popover-task-panel',
      //           title: `${task?.name || 'Task'} - Task`,
      //           group: { location: { type: 'popover' } },
      //           onPanelOpen: () => setTaskPopoverOpen(false)
      //         }}
      //       />
      //     </DockviewApiContext.Provider>
      //   </div>
      // </div>
    );
  };

  return (
    <div ref={panelRef} className="p-5 text-foreground bg-background h-[80%] overflow-hidden flex relative">
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

        <div className={`flex gap-0.5 flex-1 ${showSidebar ? 'hidden' : ''}`}>
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
          {/* Add New Chat Button */}
          <Button
            onClick={addNewChat}
            variant="outline"
            size="sm"
            className="rounded-t-md rounded-b-none"
          >
            + New Chat
          </Button>
        </div>

      </div>

      {/* Combined Context Strip - Show when chat has messages */}
      <ChatContextStrip
        activeChat={activeChat}
        isRemoteTask={isRemoteTask}
        sendMode={sendMode}
        selectedEnvironment={selectedEnvironment}
        taskDrawerOpen={taskDrawerOpen}
        setTaskDrawerOpen={setTaskDrawerOpen}
        envPopoverOpen={envPopoverOpen}
        setEnvPopoverOpen={setEnvPopoverOpen}
        envViewMode={envViewMode}
        setEnvViewMode={setEnvViewMode}
        panelRef={panelRef}
      />

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
          <div className="flex items-center gap-4">
            {/* Remote Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remote-task"
                checked={isRemoteTask}
                onChange={(e) => {
                  setIsRemoteTask(e.target.checked);
                  if (!e.target.checked) {
                    setSelectedEnvironment(null);
                  }
                }}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="remote-task" className="text-gray-300 text-sm font-medium cursor-pointer">
                Remote
              </label>
            </div>

            {/* Environment Dropdown - Show when Remote is checked */}
            {isRemoteTask && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Environment:</span>
                <select
                  value={selectedEnvironment?.id || ''}
                  onChange={(e) => {
                    const env = environments.find(env => env.id === e.target.value);
                    setSelectedEnvironment(env || null);
                  }}
                  className="px-2 py-1 bg-background border border-input rounded text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
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
                onClick={() => setSendMode('interactive')}
                variant={sendMode === 'interactive' ? 'active' : 'ghost'}
                size="sm"
                className="h-7 px-2 text-xs"
              >
                Interactive
              </Button>
              <Button
                onClick={() => setSendMode('schedule')}
                variant={sendMode === 'schedule' ? 'active' : 'ghost'}
                size="sm"
                className="h-7 px-2 text-xs"
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