import React, { useContext } from 'react';
import { DockviewApiContext } from './App';

const EnvironmentTasksPanel = (props) => {
  const { params } = props;
  const { environment } = params || {};
  const dockviewApi = useContext(DockviewApiContext);

  const environmentTasks = [
    { id: 'env_task_1', name: 'Initialize Environment', status: 'Completed', priority: 'High' },
    { id: 'env_task_2', name: 'Configure Services', status: 'In Progress', priority: 'High' },
    { id: 'env_task_3', name: 'Run Tests', status: 'Pending', priority: 'Medium' },
    { id: 'env_task_4', name: 'Deploy Changes', status: 'Pending', priority: 'Medium' },
    { id: 'env_task_5', name: 'Monitor Performance', status: 'Pending', priority: 'Low' },
  ];

  const openTaskPanel = (task) => {
    console.log('EnvironmentTasksPanel openTaskPanel called:', task);
    console.log('dockviewApi available:', !!dockviewApi);
    
    if (dockviewApi) {
      const panelId = `env_task_panel_${task.id}`;
      console.log('Attempting to add panel:', panelId);
      
      try {
        dockviewApi.addPanel({
          id: panelId,
          component: 'TaskPanel',
          title: task.name,
          params: { task: task, environment: environment },
          position: { referencePanel: props.api.id, direction: 'right' },
        });
        console.log('Panel added successfully');
      } catch (error) {
        console.error('Error adding panel:', error);
      }
    } else {
      console.error('dockviewApi is not available');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#4CAF50';
      case 'In Progress': return '#FF9800';
      case 'Pending': return '#888';
      default: return '#888';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#f44336';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return '#888';
    }
  };

  return (
    <div style={{ padding: '20px', color: 'white', height: '100%', overflowY: 'auto' }}>
      <h3 style={{ marginBottom: '20px', marginTop: 0 }}>
        {environment ? `${environment.name} - Tasks` : 'Environment Tasks'}
      </h3>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h4 style={{ margin: 0 }}>Task List</h4>
          <div style={{ fontSize: '12px', color: '#ccc' }}>
            {environmentTasks.length} tasks
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {environmentTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => openTaskPanel(task)}
              style={{
                padding: '12px 16px',
                backgroundColor: '#2a2a2a',
                borderRadius: '6px',
                cursor: 'pointer',
                border: '1px solid #444',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#3a3a3a';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#2a2a2a';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{task.name}</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ 
                    fontSize: '10px', 
                    padding: '2px 6px', 
                    borderRadius: '10px', 
                    backgroundColor: getPriorityColor(task.priority),
                    color: 'white'
                  }}>
                    {task.priority}
                  </span>
                  <span style={{ 
                    fontSize: '10px', 
                    padding: '2px 6px', 
                    borderRadius: '10px', 
                    backgroundColor: getStatusColor(task.status),
                    color: 'white'
                  }}>
                    {task.status}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#ccc' }}>
                Click to open task details and chat
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h4 style={{ marginBottom: '10px' }}>Task Statistics</h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '10px' 
        }}>
          <div style={{ 
            backgroundColor: '#1a1a1a', 
            padding: '15px', 
            borderRadius: '6px', 
            border: '1px solid #333',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>1</div>
            <div style={{ fontSize: '12px', color: '#ccc' }}>Completed</div>
          </div>
          <div style={{ 
            backgroundColor: '#1a1a1a', 
            padding: '15px', 
            borderRadius: '6px', 
            border: '1px solid #333',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>1</div>
            <div style={{ fontSize: '12px', color: '#ccc' }}>In Progress</div>
          </div>
          <div style={{ 
            backgroundColor: '#1a1a1a', 
            padding: '15px', 
            borderRadius: '6px', 
            border: '1px solid #333',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#888' }}>3</div>
            <div style={{ fontSize: '12px', color: '#ccc' }}>Pending</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentTasksPanel;