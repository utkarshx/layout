import React from 'react';

const TaskPanel = (props) => {
  const { params } = props;
  const { environment } = params || {};

  return (
    <div style={{ padding: '20px', color: 'white', height: '100%', overflowY: 'auto' }}>
      <h2 style={{ marginBottom: '15px' }}>{props.api.title}</h2>
      
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
      
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '10px' }}>Task Details</h3>
        <p>This panel contains detailed information and controls for the selected task.</p>
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
  );
};

export default TaskPanel;
