import React, { useState, useRef, useEffect, useContext } from 'react';
import { DockviewApiContext } from './App';

const TaskPanel = (props) => {
  const { params, api } = props;
  const { environment, task } = params || {};
  const dockviewApi = useContext(DockviewApiContext);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('detail');
  
  // Floating environment panel state
  const [activeEnvironmentPanel, setActiveEnvironmentPanel] = useState(null);
  
  // Check if this is a floating panel or regular panel
  const isFloatingPanel = api?.group?.location?.type === 'floating';
  
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

  const openEnvironmentPanel = () => {
    if (!environment || !dockviewApi) return;
    
    const panelId = `env_panel_${environment.name?.replace(/\s+/g, '_')}_${Date.now()}`;
    
    try {
      // Close existing environment panel if open
      if (activeEnvironmentPanel) {
        const existingPanel = dockviewApi.getPanel(activeEnvironmentPanel);
        if (existingPanel) {
          existingPanel.api.close();
        }
      }
      
      // Add environment panel to main dockview
      const panel = dockviewApi.addPanel({
        id: panelId,
        component: 'EnvironmentPanel',
        title: `${environment.name} - Environment`,
        params: { environment: environment },
      });
      
      // Get current task panel position to calculate left-side placement
      // For regular panels, we need to find the panel element
      const currentPanelElement = isFloatingPanel ? 
        document.querySelector('.dockview-floating-group') : 
        document.querySelector(`[data-panel-id="${api.id}"]`);
      const panelRect = currentPanelElement?.getBoundingClientRect();
      
      // Position to the left of current task panel with full height
      const x = panelRect ? panelRect.left - 710 : 100; // 700px width + 10px gap
      const y = 0; // Start from top
      const width = 700;
      const height = window.innerHeight; // Full height
      
      // Convert to floating group
      dockviewApi.addFloatingGroup(panel, {
        width: width,
        height: height,
        x: x,
        y: y,
      });
      
      // Track this floating environment panel
      setActiveEnvironmentPanel(panelId);
      
      console.log('Environment floating panel added successfully');
    } catch (error) {
      console.error('Error adding environment floating panel:', error);
    }
  };

  return (
    <div style={{ padding: '20px', color: 'white', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', gap: '15px' }}>
        {/* Show Environment button only in regular panels (not floating panels) */}
        {environment && !isFloatingPanel && (
          <button
            onClick={openEnvironmentPanel}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#45a049';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#4CAF50';
            }}
          >
            🌍 Environment
          </button>
        )}
        <h2 style={{ margin: 0, flex: 1 }}>{props.api.title}</h2>
      </div>
      
      {environment && (
        <div style={{ 
          backgroundColor: '#1a1a1a', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px',
          border: '1px solid #333'
        }}>
          <strong>Environment:</strong> {environment.name}
        </div>
      )}
      
      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        marginBottom: '20px',
        borderBottom: '1px solid #444',
        paddingBottom: '10px'
      }}>
        <div
          onClick={() => setActiveTab('detail')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === 'detail' ? '#007acc' : '#2a2a2a',
            color: 'white',
            border: '1px solid #444',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'detail' ? 'bold' : 'normal',
            marginRight: '4px',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'detail') {
              e.target.style.backgroundColor = '#3a3a3a';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'detail') {
              e.target.style.backgroundColor = '#2a2a2a';
            }
          }}
        >
          Task Detail
        </div>
        
        <div
          onClick={() => setActiveTab('chat')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === 'chat' ? '#007acc' : '#2a2a2a',
            color: 'white',
            border: '1px solid #444',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'chat' ? 'bold' : 'normal',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'chat') {
              e.target.style.backgroundColor = '#3a3a3a';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'chat') {
              e.target.style.backgroundColor = '#2a2a2a';
            }
          }}
        >
          Chat
        </div>
      </div>
      
      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'detail' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>Task Details</h3>
              <p>This panel contains detailed information and controls for the selected task.</p>
              {task && (
                <div style={{ marginTop: '15px' }}>
                  <p><strong>Task Name:</strong> {task.name}</p>
                  <p><strong>Status:</strong> <span style={{ color: '#FF9800' }}>In Progress</span></p>
                  <p><strong>Priority:</strong> High</p>
                  <p><strong>Assigned to:</strong> John Doe</p>
                  <p><strong>Created:</strong> 2024-01-15</p>
                  <p><strong>Due Date:</strong> 2024-01-20</p>
                </div>
              )}
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '8px' }}>Actions</h4>
              <button 
                style={{
                  padding: '8px 16px',
                  margin: '4px',
                  backgroundColor: '#007acc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Execute Task
              </button>
              <button 
                style={{
                  padding: '8px 16px',
                  margin: '4px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                View Logs
              </button>
            </div>
            
            <div>
              <h4 style={{ marginBottom: '8px' }}>Status</h4>
              <div style={{ 
                backgroundColor: '#2a2a2a', 
                padding: '10px', 
                borderRadius: '4px',
                border: '1px solid #444'
              }}>
                <div style={{ color: '#4CAF50' }}>● Ready</div>
                <div style={{ fontSize: '12px', color: '#ccc', marginTop: '4px' }}>
                  Last executed: Never
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
              Task Chat • Press Enter to send • Shift+Enter for new line
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskPanel;
