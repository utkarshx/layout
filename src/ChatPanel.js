import React, { useState, useRef, useEffect } from 'react';

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
    <div style={{ 
      padding: '20px', 
      color: 'white', 
      height: '80%', 
      overflow: 'hidden', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      
      {/* Chat Tabs */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '15px',
        borderBottom: '1px solid #444',
        paddingBottom: '10px'
      }}>
        <div style={{ display: 'flex', gap: '2px', flex: 1 }}>
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => switchChat(chat.id)}
              style={{
                padding: '8px 16px',
                backgroundColor: chat.id === activeChatId ? '#007acc' : '#2a2a2a',
                color: 'white',
                border: '1px solid #444',
                borderRadius: '4px 4px 0 0',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: chat.id === activeChatId ? 'bold' : 'normal',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (chat.id !== activeChatId) {
                  e.target.style.backgroundColor = '#3a3a3a';
                }
              }}
              onMouseLeave={(e) => {
                if (chat.id !== activeChatId) {
                  e.target.style.backgroundColor = '#2a2a2a';
                }
              }}
            >
              {chat.title}
            </div>
          ))}
        </div>
        
        {/* Add Chat Button */}
        <div
          onClick={addNewChat}
          style={{
            padding: '8px 12px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: '1px solid #444',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
          title="Add new chat"
        >
          <span>+</span>
          <span>Add Chat</span>
        </div>
      </div>
      
      {/* Chat Messages Container */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        backgroundColor: '#1a1a1a', 
        borderRadius: '8px', 
        padding: '15px',
        marginBottom: '15px',
        border: '1px solid #333'
      }}>
        {activeChat?.messages.map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                padding: '8px 12px',
                borderRadius: '12px',
                backgroundColor: message.sender === 'user' ? '#007acc' : '#333',
                color: 'white',
                wordWrap: 'break-word',
              }}
            >
              {message.text}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: '#888',
                marginTop: '4px',
              }}
            >
              {formatTime(message.timestamp)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#2a2a2a',
            border: '1px solid #444',
            borderRadius: '6px',
            color: 'white',
            resize: 'none',
            fontSize: '14px',
            fontFamily: 'inherit',
          }}
          rows={2}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            if (inputMessage.trim()) {
              e.target.style.backgroundColor = '#005a9e';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#007acc';
          }}
        >
          Send
        </button>
      </div>
      
      {/* Chat Info */}
      <div style={{ 
        marginTop: '10px', 
        fontSize: '12px', 
        color: '#888', 
        textAlign: 'center' 
      }}>
        Chat Panel • Press Enter to send • Shift+Enter for new line
      </div>
    </div>
  );
};

export default ChatPanel;