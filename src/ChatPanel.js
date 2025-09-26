import React, { useState, useRef, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Input } from './components/ui/input';

const ChatPanel = (props) => {
  // Multiple chats state
  const [chats, setChats] = useState([
    { 
      id: 'chat1', 
      title: 'Chat 1', 
      messages: [
        { id: 1, text: 'Hello! Welcome to the chat panel.', sender: 'system', timestamp: new Date() },
        { id: 2, text: 'How can I help you today?', sender: 'system', timestamp: new Date() },
      ] 
    }
  ]);
  const [activeChatId, setActiveChatId] = useState('chat1');
  const [inputMessage, setInputMessage] = useState('');
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

  return (
    <div className="p-5 text-white h-[80%] overflow-hidden flex flex-col">
      
      {/* Chat Tabs */}
      <div className="flex items-center mb-3.75 border-b border-gray-700 pb-2.5">
        <div className="flex gap-0.5 flex-1">
          {chats.map((chat) => (
            <Button
              key={chat.id}
              onClick={() => switchChat(chat.id)}
              className={`p-2 px-4 text-sm border border-gray-700 rounded-t cursor-pointer transition-colors ${
                chat.id === activeChatId 
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
      </div>
      
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