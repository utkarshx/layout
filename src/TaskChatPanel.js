import React, { useState, useRef, useEffect } from 'react';
import { Button } from './components/ui/button';
import ChatContextStrip from './ChatContextStrip';
import useAppStore from './store/useAppStore';

const TaskChatPanel = (props) => {
  const { params } = props;
  const { task, environment } = params || {};

  // Get environments from Zustand store
  const { environments } = useAppStore();

  // Chat state for task-specific chat
  const [messages, setMessages] = useState([
    { id: 1, text: `Welcome to the task chat for: ${task?.name || 'this task'}`, sender: 'system', timestamp: new Date() },
    { id: 2, text: 'You can discuss task-related details here.', sender: 'system', timestamp: new Date() },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const panelRef = useRef(null);

  // ChatContextStrip related state
  const [isRemoteTask, setIsRemoteTask] = useState(!!environment);
  const [sendMode, setSendMode] = useState('schedule'); // Default to schedule for task chats
  const [selectedEnvironment, setSelectedEnvironment] = useState(environment);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);
  const [envPopoverOpen, setEnvPopoverOpen] = useState(false);
  const [envViewMode, setEnvViewMode] = useState('info');

  // Create activeChat object to match ChatContextStrip interface
  const activeChat = {
    id: `task_${task?.id}`,
    title: task?.name || 'Task Chat',
    type: 'task',
    messages: messages
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  return (
    <div ref={panelRef} className="text-white h-full overflow-hidden flex flex-col">
      <div className="p-2.5 border-b border-gray-700 bg-black">
        <h4 className="m-0">Task Chat</h4>
      </div>
      
      <div className="flex-1 p-5 overflow-hidden flex flex-col">
        {/* Chat Context Strip */}
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
    </div>
  );
};

export default TaskChatPanel;
