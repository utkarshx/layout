import React, { useState, useRef, useEffect, useContext } from 'react';
import { DockviewApiContext } from './App';
import { Button } from './components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Input } from './components/ui/input';
import { Popover, PopoverTrigger, PopoverContent } from './components/ui/popover';
import TaskPanel from './TaskPanel';
import EnvironmentPanel from './EnvironmentPanel';

const ChatPanel = (props) => {
  const dockviewApi = useContext(DockviewApiContext);

  // Multiple chats state
  const [chats, setChats] = useState([
    {
      id: 'chat1',
      title: 'Chat 1',
      type: 'chat',
      messages: [
        { id: 1, text: 'Hello! Welcome to the chat panel.', sender: 'system', timestamp: new Date() },
        { id: 2, text: 'How can I help you today?', sender: 'system', timestamp: new Date() },
      ]
    }
  ]);
  const [activeChatId, setActiveChatId] = useState('chat1');
  const [inputMessage, setInputMessage] = useState('');
  const [taskPopoverOpen, setTaskPopoverOpen] = useState(false);
  const [showEnvironmentInTaskPopover, setShowEnvironmentInTaskPopover] = useState(false);
  const messagesEndRef = useRef(null);

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

    // Update the active chat with new message
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === activeChatId
          ? { ...chat, messages: [...chat.messages, newMessage] }
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
      type: 'chat',
      messages: [
        {
          id: 1,
          text: 'New chat created. How can I help you today?',
          sender: 'system',
          timestamp: new Date()
        }
      ]
    };

    setChats([...chats, newChat]);
    setActiveChatId(newChatId);
  };

  const addNewTask = () => {
    const newTaskId = `task${chats.length + 1}`;
    const newTask = {
      id: newTaskId,
      title: `Task ${chats.length + 1}`,
      type: 'task',
      messages: [
        {
          id: 1,
          text: 'New task created. What would you like to accomplish?',
          sender: 'system',
          timestamp: new Date()
        }
      ]
    };

    setChats([...chats, newTask]);
    setActiveChatId(newTaskId);
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
    <div className="p-5 text-white h-[80%] overflow-hidden flex flex-col">

      {/* Chat Tabs */}
      <div className="flex items-center mb-3.75 border-b border-gray-700 pb-2.5">
        <div className="flex gap-0.5 flex-1">
          {chats.map((chat) => (
            <Button
              key={chat.id}
              onClick={() => switchChat(chat.id)}
              className={`p-2 px-4 text-sm border border-gray-700 rounded-t cursor-pointer transition-colors ${chat.id === activeChatId
                  ? 'bg-blue-600 font-bold'
                  : 'bg-gray-800 hover:bg-gray-700'
                }`}
            >
              {chat.title}
            </Button>
          ))}
        </div>

        {/* Add Chat Button */}
        <Button
          onClick={addNewChat}
          className="p-2 px-3 bg-green-600 hover:bg-green-700 text-white border border-gray-700 rounded cursor-pointer text-sm font-bold flex items-center gap-1.5 transition-colors"
          title="Add new chat"
        >
          <span>+</span>
          <span>Add Chat</span>
        </Button>
        <Button
          onClick={addNewTask}
          className="p-2 px-3 bg-green-600 hover:bg-green-700 text-white border border-gray-700 rounded cursor-pointer text-sm font-bold flex items-center gap-1.5 transition-colors"
          title="Add new chat"
        >
          <span>+</span>
          <span>Add Task</span>
        </Button>
      </div>

      {/* Task Info Strip - Only show for task type */}
      {activeChat?.type === 'task' && (
        <div className="mb-3 p-2 bg-blue-900/50 border border-blue-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-300 text-sm font-medium">📋 Task:</span>
            <span className="text-white text-sm">{activeChat.title}</span>
          </div>
          <Popover open={taskPopoverOpen} onOpenChange={setTaskPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 rounded cursor-pointer transition-colors"
              >
                View Task Details
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className={showEnvironmentInTaskPopover ? "w-[1600px] h-screen p-0 bg-gray-900 border-gray-700" : "w-[800px] h-screen p-0 bg-gray-900 border-gray-700"}
              side="left"
              align="center"
            >
              <div className="h-full">
                <SplitEnvironmentPanel
                  environment={{ id: 'env1', name: 'Development Environment' }}
                  task={{ id: activeChat.id, name: activeChat.title }}
                  showEnvironment={showEnvironmentInTaskPopover}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto bg-gray-900 rounded-lg p-3.75 mb-3.75 border border-gray-800">
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
        Chat Panel • Press Enter to send • Shift+Enter for new line
      </div>
    </div>
  );
};

export default ChatPanel;