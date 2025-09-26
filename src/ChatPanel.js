import React, { useState, useRef, useEffect } from 'react';

const ChatPanel = (props) => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! Welcome to the chat panel.', sender: 'system', timestamp: new Date() },
    { id: 2, text: 'How can I help you today?', sender: 'system', timestamp: new Date() },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

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
        text: 'Thanks for your message! This is a simulated response.',
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
    <div style={{ 
      padding: '20px', 
      color: 'white', 
      height: '80%', 
      overflow: 'hidden', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      
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
        {messages.map((message) => (
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